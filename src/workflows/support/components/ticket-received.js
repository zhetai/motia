export const subscribe = ["ticket.submitted"];

export async function ticketReceived(input, emit) {
  const priority = input.text.toLowerCase().includes("urgent")
    ? "high"
    : "normal";

  emit({
    type: "ticket.processed",
    data: {
      text: input.text,
      userId: input.userId,
      priority,
      processedAt: new Date().toISOString(),
    },
  });
}

export default ticketReceived;
