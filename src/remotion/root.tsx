import React from "react";
import { Composition } from "remotion";
import { HeroBg, DURATION_FRAMES } from "./hero-bg";

/** Remotion 根:注册全部 composition */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HeroBg"
      component={HeroBg}
      durationInFrames={DURATION_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
