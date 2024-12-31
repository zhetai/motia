export const config = {
  name: "Start Event",
  subscribe: ["pms.initialize"],
  emits: ["pms.start"],
};

export default async function startEventHandler(input, emit) {
  await emit({
    type: "pms.start",
    data: {},
  });
}
