import {
	Fragment,
	VStack,
	HStack,
	ZStack,
	Link,
	Button,
	Color,
	Text,
	Time,
	ProgressView,
	Image,
	Icon,
	Svg,
	RoundedRectangle,
	UnevenRoundedRectangle,
	Rectangle,
	Sector,
	Ellipse,
	Polygon,
	Diamond,
	Circle,
	Capsule,
	Spacer,
	Group,
	Modifier,
	EmptyView,
	FullButton,
	Stamp,
	Gif,
} from 'await';

type TestEntry = {
	message: string;
	phase: number;
};

// @panel {type:'slider',min:8,max:48,step:1}
const titleSize = 18;

// @panel {type:'color'}
const accentColor = 'blue';

function widget(entry: WidgetEntry<TestEntry>) {
	const start = new Date(Date.now() - 30_000);
	const end = new Date(Date.now() + 90_000);
	const count = AwaitStore.num('count', 0);
	const name = AwaitStore.string('name');
	const items = AwaitStore.array<string>('items');
	const cached = AwaitStore.get<string>('cached');
	const enabled = AwaitStore.bool('enabled', true);
	AwaitStore.set('count', count + 1);
	AwaitStore.set('snapshot', {id: AwaitEnv.id, tag: AwaitEnv.tag, enabled});
	AwaitStore.delete('name');

	const sys = AwaitSystem.get();
	const files = AwaitFile.files('.');
	const note = AwaitFile.readText('note.txt');
	const size = AwaitFile.fileSize('note.txt');

	AwaitClipboard.set(name);
	AwaitLaunch.start('com.apple.Preferences');
	AwaitUI.haptic('light');
	AwaitAudio.setAudioSession(true, 'mix');
	AwaitAudio.playNote([60, 64, 67], {duration: 0.2, velocity: 64});
	AwaitAudio.pauseAudio();
	AwaitAudio.replayMidi({loop: false});
	AwaitAudio.stopMidi();
	print('test', AwaitEnv.host, AwaitUI.displayScale, AwaitAudio.isPlayingNote);
	void sleep(1);
	void AwaitNetwork.request('https://example.com', {
		method: 'POST',
		headers: {'content-type': 'application/json'},
		body: {count},
	});
	void AwaitNetwork.fanfou('/statuses/home_timeline', {parameters: {count: 1}});
	void AwaitWeather.get({latitude: 0, longitude: 0});
	void AwaitHealth.get();
	void AwaitLocation.get({desiredAccuracyMeters: 100, timeoutSeconds: 2});
	void AwaitCalendar.get({start: new Date(), limit: 3});
	void AwaitReminder.get({type: 'incomplete', limit: 3});
	void AwaitAlarm.schedule({title: 'Focus', duration: 60, tint: accentColor});
	AwaitAlarm.cancel('alarm-id');
	void AwaitMedia.nowPlayingMedia({artworkSize: 128});
	void AwaitMedia.mediaPlayerCommand('toggle', {source: 'song', query: 'Await', limit: 1});
	void AwaitAudio.buildSoundFont({
		savePath: 'sound.sf2',
		mediaFiles: ['note.wav'],
		mappings: [{path: 'note.wav', key: 60}],
	});
	void AwaitAudio.compressSoundFont({fromPath: 'sound.sf2', savePath: 'sound-small.sf2'});

	return (
		<ZStack
			alignment='center'
			maxSides
			background={{
				gradient: 'linear',
				colors: ['background', accentColor],
				startPoint: 'top',
				endPoint: 'bottom',
			}}
			padding={{horizontal: 12, vertical: 8}}
		>
			<Color value='red' />
			<Fragment>
				<VStack spacing={10} alignment='center'>
					<HStack spacing={8} alignment='top'>
						<Text
							value={entry.message || name || 'Hello'}
							foreground='blue'
							fontSize={titleSize}
							fontWeight='bold'
							fontDesign='rounded'
							lineLimit={2}
							minimumScaleFactor={0.6}
						/>
						<Icon value='star' foreground='yellow' />
						<Image url='https://example.com/img.png' resizable aspectRatio='fit' interpolation='high' />
						<Time date={entry.date} style='time' />
						<ProgressView value={0.4} progressViewStyle='linear' />
						<ProgressView value={[start, end]} progressViewStyle='automatic' />
						<ProgressView value={[start, end]} countsDown={false} progressViewStyle='circular' />
						<ProgressView value={[end, start]} />
					</HStack>
					<Link url='https://example.com'>
						<Text value={`${entry.family}:${entry.renderingMode}`} underline />
					</Link>
					<Text value={items.join(',')} />
					<Text value={cached ?? note ?? 'empty'} />
					<Text value={`${sys.battery.percent}:${size ?? 0}:${files.length}`} monospacedDigit />
					<Group id='shapes' overlay={{alignment: 'topTrailing', content: <Stamp id='stamp' />}}>
						<RoundedRectangle rectRadius={12} fill='white' stroke={{color: 'black', lineWidth: 2}} />
						<UnevenRoundedRectangle rectRadius={{top: 16, bottom: 4}} fill='thin' />
						<Rectangle fill={{dark: 'gray', light: 'white'}} />
						<Sector value={[0, 0.75]} fill='orange' />
						<Ellipse fill={{gradient: 'radial', colors: ['pink', 'purple'], endRadius: 24}} />
						<Polygon value={[[0, 0], [20, 0], [10, 18]]} fill='teal' />
						<Diamond fill='mint' rotationEffect={{angle: 45, anchor: 'center'}} />
						<Circle fill='white' stroke={{color: 'black', lineWidth: 2, dash: [2, 3]}} />
						<Capsule fill='primary' />
					</Group>
					<Gif size={{width: 48, height: 48}} duration={4}>
						<Color value='red' />
						<Color value='green' />
						<Color value='blue' />
						<Color value='yellow' />
					</Gif>
					<Button intent={app.tap(1)} fast audio buttonStyle='borderedProminent'>
						<Text value='Tap me' />
					</Button>
					<FullButton intent={app.open('https://example.com')} url='https://example.com' />
					<Spacer minLength={20} />
					<Group id='group1' transition={['push', 'top']}>
						<EmptyView id='empty' />
						<Modifier id='modifier' opacity={0.5} />
						<Svg value='<svg viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>' />
					</Group>
				</VStack>
			</Fragment>
		</ZStack>
	);
}

function tap(step: number) {
	AwaitStore.set('count', step);
}

function open(url: string) {
	AwaitLaunch.start(url);
}

const app = Await.define({
	widget,
	widgetTimeline(context) {
		return {
			entries: [
				{date: new Date(), message: context.family, phase: 0},
				{date: new Date(Date.now() + 60_000), message: context.family, phase: 1},
			],
			update: 'rapid',
			skipOnPlayingNote: true,
		};
	},
	widgetIntents: {tap, open},
});
