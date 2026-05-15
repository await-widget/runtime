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
	export function Link(
		props: LinkValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	export function Button(
		props: ButtonValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	export function Color(
		props: ColorValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Text(
		props: TextValue &
			ID &
			Mods & {
				children?: NativeView;
			},
	): NativeView;
	export function Time(
		props: TimeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Image(
		props: ImageValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Icon(
		props: IconValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Svg(
		props: SvgValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function RoundedRectangle(
		props: RoundedRectangleValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function UnevenRoundedRectangle(
		props: UnevenRoundedRectangleValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Rectangle(
		props: ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Sector(
		props: SectorValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Ellipse(
		props: ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Circle(
		props: ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Polygon(
		props: PolygonValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Diamond(
		props: ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Capsule(
		props: CapsuleValue &
			ShapeValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
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
	export function FullButton(
		props: ButtonValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Stamp(
		props: ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function VFlip(
		props: FlipValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function HFlip(
		props: FlipValue &
			ID &
			Mods & {
				children?: never;
			},
	): NativeView;
	export function Gif(
		props: GifValue &
			ID &
			Mods & {
				children: NativeView[];
			},
	): NativeView;
	export function Ticker(
		props: TickerValue &
			ID &
			Mods & {
				children: NativeView[];
			},
	): NativeView;
}

declare module 'await/jsx-runtime' {
	export {Fragment, jsx, jsx as jsxs} from 'await';
}
