export type Die = { value: number; hunger: boolean };

export function interpretDice(dice: Die[], difficulty: number) {
  if (!dice.length) return { title: "Пул готов", text: "Укажи кости и соверши бросок.", success: false };
  const successes = dice.filter((d) => d.value >= 6).length;
  const tens = dice.filter((d) => d.value === 10);
  const critPairs = Math.floor(tens.length / 2);
  const total = successes + critPairs * 2;
  const messy = total >= difficulty && critPairs > 0 && tens.some((d) => d.hunger);
  const bestial = total < difficulty && dice.some((d) => d.hunger && d.value === 1);
  if (messy) return { title: `Грязный крит · ${total} успехов`, text: "Ты добиваешься своего, но Зверь оставляет след.", success: true };
  if (bestial) return { title: `Звериный провал · ${total} успехов`, text: "Неудача пробуждает Компульсию или иное проявление Зверя.", success: false };
  if (critPairs && total >= difficulty) return { title: `Критический успех · ${total} успехов`, text: "Пара десяток добавила два дополнительных успеха.", success: true };
  if (total >= difficulty) return { title: `Успех · ${total} против ${difficulty}`, text: "Действие удалось.", success: true };
  return { title: `Провал · ${total} против ${difficulty}`, text: "Цель не достигнута — ситуация меняется.", success: false };
}
