/// <reference path="./model.d.ts" />
/// <reference path="./meta.d.ts" />
/// <reference path="./prop.d.ts" />
/// <reference path="./jsx.d.ts" />
/// <reference path="./bridge.d.ts" />
declare module 'await' {
	export const Fragment: ({children}: {children: NativeView}) => NativeView;
	export const jsx: (
		create: (props: Props) => NativeView,
		props: Props,
	) => NativeView;
	/** This is an experimental component and may change in the future. */
	export function Scroll(
		props: ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	export function VStack(
		props: VStackValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	export function HStack(
		props: HStackValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	export function ZStack(
		props: ZStackValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	/** Opens a custom-scheme URL or universal link through the Await app when tapped. */
	export function Link(
		props: LinkValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	/** When tapped, runs an intent or opens a universal link directly without going through the Await app. */
	export function Button(
		props: ButtonValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	/** Displays a solid color and expands to fill the available space. */
	export function Color(
		props: ColorValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Displays text and can contain nested `Text` or `Image` views. */
	export function Text(
		props: TextValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	/** Displays an automatically updating clock or countdown. */
	export function Time(
		props: TimeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function ProgressView(
		props: ProgressViewValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Gauge(
		props: GaugeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Displays an image from a local or remote path, or renders child views as an image. Avoid large or complex child content due to system limits. */
	export function Image(
		props: ImageValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	/** Displays a system SF Symbol. */
	export function Icon(
		props: IconValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Displays an SVG from a local or remote path, or from raw SVG markup. */
	export function Svg(
		props: SvgValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws a rounded rectangle that expands to fill the available space. */
	export function RoundedRectangle(
		props: RoundedRectangleValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws a rounded rectangle with independently configurable corners that expands to fill the available space. */
	export function UnevenRoundedRectangle(
		props: UnevenRoundedRectangleValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws a rectangle that expands to fill the available space. */
	export function Rectangle(
		props: ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws a circular sector that expands to fill the available space. */
	export function Sector(
		props: SectorValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws an ellipse that expands to fill the available space. */
	export function Ellipse(
		props: ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws a circle that expands to fill the available space. */
	export function Circle(
		props: ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws a polygon that expands to fill the available space. */
	export function Polygon(
		props: PolygonValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws a diamond that expands to fill the available space. */
	export function Diamond(
		props: ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Draws a capsule that expands to fill the available space. */
	export function Capsule(
		props: CapsuleValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Adds flexible space within an `HStack` or `VStack`, expanding to fill the available space. */
	export function Spacer(
		props: SpacerValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Group(
		props: ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	/** Creates a modifier for use in a `CustomButtonStyle`. */
	export function Modifier(
		props: ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function EmptyView(
		props: ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Creates a transparent button that expands to fill the available space. */
	export function FullButton(
		props: ButtonValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Displays a random number for debugging. */
	export function Stamp(
		props: ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Creates a vertical page-flip effect. */
	export function VFlip(
		props: FlipValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Creates a horizontal page-flip effect. */
	export function HFlip(
		props: FlipValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Creates a flip transition around the x-axis. */
	export function XFlip(
		props: AxisFlipValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Creates a flip transition around the y-axis. */
	export function YFlip(
		props: AxisFlipValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	/** Creates a GIF-like animation with limited system support. Only specific durations are available, transparency is not supported directly, and frame dimensions and count should remain small. */
	export function Gif(
		props: GifValue &
			ID &
			Mods & {
				children: NativeView[];
			},
	): NativeView;
	/** Cycles through a sequence of views based on the selected time unit, enabling effects such as a ticking second hand. Available on iOS 26 and later. */
	export function Ticker(
		props: TickerValue &
			ID &
			Mods & {
				children: NativeView[];
			},
	): NativeView;
	/** Flashes once per second in a 60-second cycle, achieving the effect of a ticking second hand. Available on iOS 18 and later. */
	export function FlashTicker(
		props: {
			size: Size;
		} & ID &
			Mods & {
				children: NativeView[];
			},
	): NativeView;
}

declare module 'await/jsx-runtime' {
	export {Fragment, jsx, jsx as jsxs} from 'await';
}
