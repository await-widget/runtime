import {
  Fragment,
  VStack,
  HStack,
  ZStack,
  Button,
  Color,
  Text,
  Time,
  Image,
  Icon,
  Svg,
  RoundedRectangle,
  Circle,
  Capsule,
  Spacer,
  Group,
  EmptyView,
  FullButton,
  Stamp,
} from "await";

function widget(entry: WidgetEntry) {
  const count = AwaitStore.num("count", 0);
  const name = AwaitStore.string("name");
  const items = AwaitStore.array<string>("items");
  const cached = AwaitStore.get<string>("cached");
  AwaitStore.set("count", count + 1);
  AwaitStore.delete("name");

  const sys = AwaitSystem.get();
  void AwaitNetwork.request("https://example.com");
  void AwaitWeather.get({ latitude: 0, longitude: 0 });
  void AwaitHealth.get();
  void AwaitLocation.get();
  void AwaitCalendar.get();
  void AwaitReminder.get();
  void AwaitMedia.nowPlayingMedia();
  void AwaitMedia.mediaPlayerCommand("toggle");
  AwaitUI.haptic("light");

  return (
    <ZStack alignment="center">
      <Color value="red" />
      <VStack spacing={10} alignment="center">
        <HStack spacing={8} alignment="top">
          <Text value="Hello" foreground="blue" fontSize={16} fontWeight="bold" />
          <Icon value="star" foreground="yellow" />
          <Image url="https://example.com/img.png" resizable aspectRatio="fit" />
          <Time date={new Date()} style="time" />
        </HStack>
        <RoundedRectangle rectRadius={12} fill="white" stroke={{ color: "black", lineWidth: 2 }} />
        <Circle fill="white" stroke={{ color: "black", lineWidth: 2 }} />
        <Capsule fill="primary" />
        <Button intent={app.tap(1)} fast audio>
          <Text value="Tap me" />
        </Button>
        <FullButton intent={app.tap(2)} url="https://example.com" />
        <Spacer minLength={20} />
        <Group id="group1">
          <EmptyView id="empty" />
          <Stamp id="stamp1" />
        </Group>
        <Svg value="<svg></svg>" />
      </VStack>
    </ZStack>
  );
}

function tap(step: number) {
  AwaitStore.set("count", step);
}

const app = Await.define({
  widget,
  widgetIntents: { tap },
});