import * as React from "react";
import Svg, { SvgProps, Circle } from "react-native-svg";

export const YourLocationIcon = (props: SvgProps) => (
  <Svg width={32} height={32} fill="none" {...props}>
    <Circle cx={16} cy={16} r={16} fill="#000" fillOpacity={0.25} />
    <Circle cx={16} cy={16} r={9.6} fill="#fff" />
    <Circle cx={16} cy={16} r={6.857} fill="#5494DA" />
  </Svg>
);
