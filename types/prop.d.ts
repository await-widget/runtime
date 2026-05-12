type Props = Record<string, unknown>;

type VStackValue = {
	/** Default 0. */
	spacing?: number;
	/** Horizontal alignment for child views. */
	alignment?: HorizontalAlignment;
};

type HStackValue = {
	/** Default 0. */
	spacing?: number;
	/** Vertical alignment for child views. */
	alignment?: VerticalAlignment;
};

type ZStackValue = {
	/** Horizontal and vertical alignment for child views. */
	alignment?: Alignment;
};

type ButtonValue = {
	/** Intent returned by `Await.define(...)`, used to run a registered widget intent when the button is tapped. */
	intent?: IntentInfo;
	/** Only applies in the app; triggers the button as soon as the touch begins. */
	fast?: boolean;
	/** Requests permission to play audio. */
	audio?: boolean;
	/** Opens a universal link directly, such as `https://github.com/await-widget/skills`. */
	url?: string;
};

type ShapeValue = {
	/** Default black on light theme, white on dark theme. */
	fill?: ShapeStyle;
	/** Only centered strokes are supported. */
	stroke?: {
		color?: Color;
		lineWidth?: number;
		lineCap?: string;
		lineJoin?: string;
		miterLimit?: number;
		dash?: number[];
		dashPhase?: number;
	};
	shape?: {
		trim?: [number, number];
		rotation?: RotationEffect;
		offset?: Point;
		scale?: ScaleEffect;
		in?: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
	};
};

type RoundedRectangleValue = {
	rectRadius?: Dimension;
	/** Default `continuous`. */
	style?: CornerRadiusStyle;
};

type UnevenRoundedRectangleValue = {
	rectRadius?: {
		topLeft?: Dimension;
		topRight?: Dimension;
		bottomRight?: Dimension;
		bottomLeft?: Dimension;
		bottom?: Dimension;
		top?: Dimension;
		left?: Dimension;
		right?: Dimension;
	};
	style?: CornerRadiusStyle;
};

type CapsuleValue = {
	style?: CornerRadiusStyle;
};

type SectorValue = {
	value: [start: number, end: number];
};

type PolygonValue = {
	value: Array<[x: number, y: number]>;
};

type LinkValue = {
	url?: string;
};

type ColorValue = {
	value?: Color;
};

type TextValue = {
	/** Text or encodable value rendered by the component. */
	value?: Encodable;
};

type ImageValue = {
	/** Local or remote path such as `img.png` `path/img.png` `https://example.com/img.png` */
	url?: string;
	/** The modes used to resize an image to fit within its containing view. */
	resizable?: Resizable;
	/** The level of quality for rendering an image that requires interpolation, such as a scaled image. */
	interpolation?: Interpolation;
	/** A type that indicates how images are rendered */
	style?: TemplateRenderingMode;
};

type IconValue = {
	/** The name of the system symbol image. Use the SF Symbols app to look up the names of system symbol images. */
	value?: string;
};

type TimeValue = {
	date?: Date;
	/** Use `timer` to update once per second. */
	style?: TimeStyle;
};

type SvgValue = {
	/** For example, `img.png`, `path/img.png`, or `https://example.com/img.png`. */
	url?: string;
	/** For example, `<svg><path d="M0 0h10v10h-10z"/></svg>`. */
	value?: string;
};

type SpacerValue = {
	minLength?: number;
};

type GifValue = {
	size: Size;
	duration: GifDuration;
};

type Mods = {
	[K in keyof BaseMods]?: BaseMods[K];
} & {
	[K in keyof BaseMods as `${K & string}_${string}`]?: BaseMods[K];
};

type BaseMods = {
	animation?: NativeAnimation | number | '';
	aspectRatio?: AspectRatio;
	background?:
		| ShapeStyle
		| NativeView
		| {alignment: Alignment; content: NativeView};
	baselineOffset?: number;
	blendMode?: BlendMode;
	blur?: Blur;
	brightness?: number;
	buttonStyle?: ButtonStyle;
	clipped?: boolean;
	clipShape?: NativeView | '';
	colorInvert?: boolean;
	colorMultiply?: Color;
	compositingGroup?: boolean;
	contentShape?: NativeView | '';
	contentTransition?: ContentTransition;
	contrast?: number;
	cornerRadius?: number;
	debug?: boolean;
	disable?: boolean;
	drawingGroup?: boolean;
	fixedSize?: FixedSize;
	font?: Font | '';
	fontDesign?: FontDesign | '';
	fontSize?: number;
	fontWeight?: FontWeight | '';
	fontWidth?: FontWidth | '';
	foreground?: ShapeStyle;
	frame?: Frame;
	geometryGroup?: boolean;
	grayscale?: number;
	height?: number;
	hidden?: boolean;
	hueRotation?: number;
	ignoresSafeArea?: boolean;
	italic?: boolean;
	kerning?: number;
	layoutPriority?: number;
	lineHeight?: LineHeight | '';
	lineLimit?: number | '';
	lineSpacing?: number;
	luminanceToAlpha?: boolean;
	mask?: NativeView;
	maxHeight?: Dimension | boolean;
	maxSides?: Dimension | boolean;
	maxWidth?: Dimension | boolean;
	minimumScaleFactor?: number;
	monospaced?: boolean;
	monospacedDigit?: boolean;
	offset?: Point;
	offsetX?: number;
	offsetY?: number;
	opacity?: number;
	overlay?:
		| ShapeStyle
		| NativeView
		| {alignment: Alignment; content: NativeView};
	padding?: Padding | boolean;
	pixelPerfectCenter?: boolean | Point;
	position?: Point;
	reverseMask?: NativeView;
	rotation3DEffect?: Rotation3DEffect;
	rotationEffect?: RotationEffect;
	saturation?: number;
	scaleEffect?: ScaleEffect;
	shadow?: Shadow;
	sides?: number;
	strikethrough?:
		| boolean
		| {isActive?: boolean; pattern?: Pattern; color?: Color};
	test?: unknown;
	textAlignment?: TextAlignment;
	tint?: ShapeStyle;
	tracking?: number;
	transform?: [number, number, number, number, number, number];
	transition?: Transition;
	truncationMode?: 'head' | 'middle' | 'tail';
	typesettingLanguage?: string;
	underline?: boolean | {isActive?: boolean; pattern?: Pattern; color?: Color};
	width?: number;
	zIndex?: number;
};
