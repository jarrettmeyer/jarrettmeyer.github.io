export function toFriendlyDate(date: Date): string {
  const monthNum: number = date.getUTCMonth();
  const dateNum: number = date.getUTCDate();
  const yearNum: number = date.getUTCFullYear();

  const months: Record<number, string> = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec",
  };
  const month = months[monthNum];

  return `${dateNum} ${month} ${yearNum}`;
}
