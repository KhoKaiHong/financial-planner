import * as React from "react";
import Svg, { SvgProps, Circle } from "react-native-svg";

export const YourLocationIconDisplay = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" {...props}>
    <Circle cx={8} cy={8} r={8} fill="#5494DA" />
  </Svg>
);