export const config = {
  name: "Start Event",
  // If you need an explicit runtime marker, uncomment:
  // endpoint: "wistro-server",
  subscribes: ["ws-server-example.trigger"],
  emits: ["ws-server-example.start"],
};

export default async (_, emit) => {
  console.log("[Start Event] triggered via /api/wistro-server-example");
  await emit({
    type: "ws-server-example.start",
    data: { message: "The workflow has been started!" },
  });
};
