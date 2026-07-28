type CornerRadiusStyle = 'circular' | 'continuous';

type GaugeStyle =
	| 'accessoryCircular'
	| 'accessoryCircularCapacity'
	| 'accessoryLinear'
	| 'accessoryLinearCapacity'
	| 'linearCapacity'
	| 'automatic';

type TimeStyle = 'time' | 'date' | 'relative' | 'offset' | 'timer';

type ProgressViewStyle = 'automatic' | 'linear' | 'circular';

type Material = 'regular' | 'thin' | 'thick' | 'ultraThin' | 'ultraThick';

type ShapeStyle =
	| Color
	| Material
	| LinearGradient
	| RadialGradient
	| AngularGradient
	| 'primary'
	| 'secondary'
	| 'tertiary'
	| 'quaternary'
	| 'quinary';

type NativeAnimation = (
	| {
			type?:
				| 'linear'
				| 'default'
				| 'easeIn'
				| 'easeInOut'
				| 'easeOut'
				| 'circularEaseIn'
				| 'circularEaseInOut'
				| 'circularEaseOut';
			duration?: number;
	  }
	| {
			type: 'interactiveSpring';
			blendDuration?: number;
			duration?: number;
			bounce?: number;
	  }
	| {
			type: 'bouncy';
			bounce?: number;
			duration?: number;
	  }
	| {
			type: 'smooth';
			duration?: number;
			bounce?: number;
	  }
	| {
			type: 'spring';
			blendDuration?: number;
			duration?: number;
			bounce?: number;
	  }
	| {
			type: 'timingCurve';
			start: UnitPoint;
			end: UnitPoint;
			duration?: number;
	  }
	| {
			type: 'snappy';
			bounce?: number;
			duration?: number;
	  }
) & {
	value?: unknown;
	delay?: number;
	autoreverses?: boolean;
	speed?: number;
	loop?: boolean | number;
};

type ContentTransition =
	| 'identity'
	| 'interpolate'
	| 'opacity'
	| 'symbolEffect'
	| 'numericText'
	| ['numericText', boolean]
	| ['numericText', number];

type Edge = 'top' | 'bottom' | 'leading' | 'trailing';

type RawTransition =
	| 'identity'
	| 'blurReplace'
	| 'opacity'
	| 'slide'
	| 'scale'
	| ['scale', number, UnitPoint?]
	| ['push', Edge]
	| ['offset', number, number]
	| ['move', Edge];

type Transition = RawTransition | [RawTransition, RawTransition];

type Padding =
	| number
	| {
			left?: number;
			right?: number;
			top?: number;
			bottom?: number;
			vertical?: number;
			horizontal?: number;
			other?: number;
	  };

type RadialGradient = {
	gradient: 'radial';
	color?: Color;
	colors?: Color[];
	stops?: Array<[Color, number]>;
	startRadius?: number;
	endRadius?: number;
};

type AngularGradient = {
	gradient: 'angular';
	color?: Color;
	colors?: Color[];
	stops?: Array<[Color, number]>;
	angle?: number;
	center?: UnitPoint;
};

type LinearGradient = {
	gradient: 'linear';
	color?: Color;
	colors?: Color[];
	stops?: Stop[];
	startPoint?: UnitPoint;
	endPoint?: UnitPoint;
};

type UnitPoint =
	| 'center'
	| 'zero'
	| 'leading'
	| 'trailing'
	| 'top'
	| 'topLeading'
	| 'topTrailing'
	| 'bottom'
	| 'bottomLeading'
	| 'bottomTrailing'
	| Point;

type Stop = [Color, number];

type RawColor =
	| ''
	| 'background'
	| 'black'
	| 'blue'
	| 'brown'
	| 'cyan'
	| 'gray'
	| 'green'
	| 'indigo'
	| 'magenta'
	| 'mint'
	| 'orange'
	| 'pink'
	| 'primary'
	| 'purple'
	| 'red'
	| 'secondary'
	| 'teal'
	| 'white'
	| 'yellow'
	| string
	| number;

type RawThemeColor = RawColor | [RawColor, number];

type Color =
	| RawThemeColor
	| {
			dark?: RawThemeColor;
			light?: RawThemeColor;
	  };

type VerticalAlignment =
	| 'firstTextBaseline'
	| 'lastTextBaseline'
	| 'top'
	| 'bottom'
	| 'center';

type HorizontalAlignment =
	| 'listRowSeparatorLeading'
	| 'listRowSeparatorTrailing'
	| 'leading'
	| 'trailing'
	| 'center';

type Alignment =
	| 'leading'
	| 'trailing'
	| 'top'
	| 'bottom'
	| 'topLeading'
	| 'topTrailing'
	| 'bottomLeading'
	| 'bottomTrailing'
	| 'center'
	| 'trailingFirstTextBaseline'
	| 'leadingLastTextBaseline'
	| 'leadingFirstTextBaseline'
	| 'centerLastTextBaseline'
	| 'centerFirstTextBaseline'
	| 'trailingLastTextBaseline';

type Dimension = 'max' | number;

type Size = {
	width: number;
	height: number;
};

type TemplateRenderingMode = 'original' | 'template';

type AspectRatio =
	| 'fill'
	| 'fit'
	| [aspectRatio: number, contentMode: 'fill' | 'fit'];

type IntentInfo = {
	name: string;
	args: Encodable[];
};

type Encodable =
	| string
	| number
	| boolean
	| undefined
	| Encodable[]
	| {
			[key: string]: Encodable;
	  };

type ID = {
	id?: Encodable;
};

type TextAlignment = 'center' | 'leading' | 'trailing';

type FontDesign = 'monospaced' | 'rounded' | 'serif' | 'default';

type FontWeight =
	| 100
	| 'ultraLight'
	| 200
	| 'thin'
	| 300
	| 'light'
	| 400
	| 'regular'
	| 500
	| 'medium'
	| 600
	| 'semibold'
	| 700
	| 'bold'
	| 800
	| 'heavy'
	| 900
	| 'black';

type FontWidth = 'compressed' | 'condensed' | 'standard' | 'expanded' | number;

type Interpolation = 'none' | 'low' | 'medium' | 'high';

type Resizable = boolean | 'stretch' | 'tile';

type Point =
	| number
	| {
			x?: number;
			y?: number;
	  };

type ScaleEffect =
	| number
	| {
			scale?: number;
			anchor?: UnitPoint;
	  }
	| {
			x?: number;
			y?: number;
			anchor?: UnitPoint;
	  };

type Font = {
	name: string;
	size: number;
	wght?: number;
	wdth?: number;
	opsz?: number;
	slnt?: number;
	ital?: number;

	GRAD?: number;
	HGHT?: number;
	SOFT?: number;

	monospacedDigit?: boolean;
	features?: string[] | string;
};

type Rotation3DEffect = {
	angle: number;
	x?: number;
	y?: number;
	z?: number;
	anchor?: UnitPoint;
	anchorZ?: number;
	perspective?: number;
};

type RotationEffect =
	| number
	| {
			angle: number;
			anchor: UnitPoint;
	  };

type Frame =
	| {
			maxWidth?: Dimension;
			maxHeight?: Dimension;
			alignment?: Alignment;
	  }
	| {
			width?: number;
			height?: number;
			alignment?: Alignment;
	  };

type Shadow = {
	color?: Color;
	x?: number;
	y?: number;
	blur?: number;
};

type Pattern = 'dash' | 'dashDot' | 'dashDotDot' | 'dot' | 'solid';

type BlendMode =
	| 'normal'
	| 'multiply'
	| 'screen'
	| 'overlay'
	| 'darken'
	| 'lighten'
	| 'colorDodge'
	| 'colorBurn'
	| 'softLight'
	| 'hardLight'
	| 'difference'
	| 'exclusion'
	| 'hue'
	| 'saturation'
	| 'color'
	| 'luminosity'
	| 'sourceAtop'
	| 'destinationOver'
	| 'destinationOut'
	| 'plusDarker'
	| 'plusLighter';

type ButtonStyle =
	| 'automatic'
	| 'bordered'
	| 'borderedProminent'
	| 'borderless'
	| 'plain'
	| CustomButtonStyle;

type CustomButtonStyle = {
	press: NativeView;
	normal: NativeView;
};

type GifDuration = 2 | 4 | 6 | 10 | 12 | 20 | 30 | 60;

type TickerStyle = 'minute' | 'second' | 'hour12' | 'hour24';

type LineHeight =
	| number
	| 'loose'
	| 'normal'
	| 'tight'
	| 'variable'
	| [type: 'multiple' | 'leading', value: number];

type Blur =
	| number
	| {
			blur: number;
			opaque?: boolean;
	  };

type FixedSize =
	| boolean
	| {
			horizontal?: boolean;
			vertical?: boolean;
	  };

type strikethrough =
	| boolean
	| {
			isActive?: boolean;
			color?: Color;
	  };

type DateFormatYearToken = {
	field: 'year';
	style?: 'default' | 'twoDigits';
};

type DateFormatMonthToken = {
	field: 'month';
	style?: 'default' | 'twoDigits' | 'short' | 'long';
};

type DateFormatDayToken = {
	field: 'day';
	style?: 'default' | 'twoDigits';
};

type DateFormatDayOfYearToken = {
	field: 'dayOfYear';
	style?: 'default' | 'twoDigits' | 'threeDigits';
};

type DateFormatHourToken = {
	field: 'hour';
	style?: 'default' | 'twoDigits';
	/** Omit to use the system hour cycle. */
	cycle?: 12 | 24;
};

type DateFormatMinuteToken = {
	field: 'minute';
	style?: 'default' | 'twoDigits';
};

type DateFormatSecondToken = {
	field: 'second';
	style?: 'default' | 'twoDigits';
};

type DateFormatFractionalSecondToken = {
	field: 'fractionalSecond';
	digits: 1 | 2 | 3;
};

type DateFormatAMPMToken = {
	field: 'ampm';
};

type DateFormatTimeZoneToken = {
	field: 'zone';
	style?: 'short' | 'long' | 'identifier' | 'city';
};

type DateFormatToken =
	| string
	| DateFormatYearToken
	| DateFormatMonthToken
	| DateFormatDayToken
	| DateFormatDayOfYearToken
	| DateFormatHourToken
	| DateFormatMinuteToken
	| DateFormatSecondToken
	| DateFormatFractionalSecondToken
	| DateFormatAMPMToken
	| DateFormatTimeZoneToken;
