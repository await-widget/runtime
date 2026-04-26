import { Image, Text, VStack } from "await";

function widget() {
  const cached = AwaitStore.string("imageUrl");
  void AwaitNetwork.request("https://example.com");

  return (
    <VStack padding={12}>
      <Text value={`Cached: ${cached}`} />
      <Image url={cached} resizable aspectRatio="fit" />
    </VStack>
  );
}

Await.define({
  widget,
});
