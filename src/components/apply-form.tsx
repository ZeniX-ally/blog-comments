"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { dict, type Lang } from "@/lib/i18n";
import {
  APPLY_PATH,
  EVENT_ERROR,
  EVENT_SUBMIT,
  EVENT_SUCCESS,
  isValidEmail,
  type Attribution,
} from "@/lib/apply";
import { captureAttribution } from "@/lib/capture";
import { track } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * 邀请码申请表单：邮箱 + 蜜罐字段。
 * 蜜罐是视觉隐藏的输入框，真人看不见、脚本会填，服务端见到有值就静默丢弃。
 * 停留时长（挂载到提交的毫秒数）一并上报，服务端用它拦掉秒提交的脚本。
 */
export function ApplyForm({ lang }: { lang: Lang }) {
  const d = dict[lang].gongyi.form;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);
  const mountedAt = useRef(0);
  const attribution = useRef<Attribution>({ source: "", ref: "" });

  useEffect(() => {
    mountedAt.current = Date.now();
    attribution.current = captureAttribution();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage(d.invalidEmail);
      return;
    }

    setStatus("submitting");
    setMessage("");
    track(EVENT_SUBMIT, { source: attribution.current.source });

    try {
      const res = await fetch(APPLY_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: attribution.current.source,
          ref: attribution.current.ref,
          hp: honeypot.current?.value ?? "",
          elapsed: mountedAt.current ? Date.now() - mountedAt.current : -1,
        }),
      });

      if (res.ok) {
        setStatus("success");
        track(EVENT_SUCCESS, { source: attribution.current.source });
        return;
      }

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setMessage(res.status === 429 ? d.rateLimited : d.failed);
      track(EVENT_ERROR, {
        source: attribution.current.source,
        reason: String(body.error ?? res.status),
      });
    } catch {
      setStatus("error");
      setMessage(d.failed);
      track(EVENT_ERROR, { source: attribution.current.source, reason: "network" });
    }
  }

  if (status === "success") {
    return (
      <p className="apply-form-status is-success" role="status">
        {d.success}
      </p>
    );
  }

  return (
    <form className="apply-form" onSubmit={onSubmit} noValidate>
      <label className="apply-form-field">
        <span>{d.emailLabel}</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={d.placeholder}
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>

      {/* 蜜罐：真人看不见，脚本会填；有值即被服务端静默丢弃 */}
      <input
        ref={honeypot}
        className="apply-form-honey"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button type="submit" className="pill" disabled={status === "submitting"}>
        {status === "submitting" ? d.submitting : d.submit}
      </button>

      <p
        className={`apply-form-status${status === "error" ? " is-error" : ""}`}
        role={status === "error" ? "alert" : "status"}
      >
        {message}
      </p>
    </form>
  );
}
