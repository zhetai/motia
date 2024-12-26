export const path = "/api/data/upload";
export const method = "POST";

export default (req) => {
  return {
    type: "processing.uploaded",
    data: { rawData },
  };
};
