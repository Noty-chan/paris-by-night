export type Character = {
  id: string;
  version: number;
  updatedAt: string;
  name: string;
  concept: string;
  player: string;
  clan: string;
  sire: string;
  generation: string;
  predatorType: string;
  ambition: string;
  desire: string;
  attributes: Record<string, number>;
  skills: Record<string, number>;
  hunger: number;
  humanity: number;
  willpower: number;
  health: number;
  bloodPotency: number;
  convictions: string;
  touchstones: string;
  notes: string;
};

export const defaultCharacter: Character = {
  id: "paris-blank-01",
  version: 1,
  updatedAt: "2004-10-17T00:42:00+02:00",
  name: "Без имени",
  concept: "Ночной свидетель",
  player: "",
  clan: "Не определён",
  sire: "",
  generation: "13",
  predatorType: "",
  ambition: "",
  desire: "",
  attributes: {
    Сила: 1, Ловкость: 1, Выносливость: 1,
    Обаяние: 1, Манипуляция: 1, Самообладание: 1,
    Интеллект: 1, Смекалка: 1, Решительность: 1,
  },
  skills: {
    Атлетика: 0, Драка: 0, Вождение: 0, Скрытность: 0,
    Проницательность: 0, Убеждение: 0, Запугивание: 0, Уличное_чутьё: 0,
    Расследование: 0, Оккультизм: 0, Политика: 0, Технология: 0,
  },
  hunger: 1,
  humanity: 7,
  willpower: 3,
  health: 3,
  bloodPotency: 1,
  convictions: "",
  touchstones: "",
  notes: "",
};
