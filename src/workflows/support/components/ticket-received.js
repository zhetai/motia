export const subscribe = ["support.submitted"];

export async function ticketReceived(input, emit) {
  const priority = input.text.toLowerCase().includes("urgent")
    ? "high"
    : "normal";

  emit({
    type: "support.processed",
    data: {
      text: input.text,
      userId: input.userId,
      priority,
      processedAt: new Date().toISOString(),
    },
  });
}

export default ticketReceived;
