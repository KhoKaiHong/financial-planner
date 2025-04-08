import * as React from "react"
import Svg, {
  SvgProps,
  Defs,
  LinearGradient,
  Stop,
  Path,
} from "react-native-svg"

export const GeminiIcon = (props: SvgProps) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    {...props}
  >
    <Defs>
      <LinearGradient id="a" x1="0%" x2="68.73%" y1="100%" y2="30.395%">
        <Stop offset="0%" stopColor="#1C7DFF" />
        <Stop offset="52.021%" stopColor="#1C69FF" />
        <Stop offset="100%" stopColor="#F0DCD6" />
      </LinearGradient>
    </Defs>
    <Path
      fill="url(#a)"
      d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.305 14.305 0 0 0 12 12 14.305 14.305 0 0 0-12 12"
    />
  </Svg>
)

