// Exact descriptions directly from be.html (Minecraft Wiki: Зіллєваріння)
// In be.html:
// 1. Reagents have NO long text descriptions; only their title (e.g. "Незерський наріст", "Цукор").
// 2. The ONLY item with a special description is "Панцир черепахи" (&7Коли на голові: / &9+2 захисту).
// 3. Potions have maximally short effect names (&9Миттєве зцілення, &cОтруєння (0:45), &7Немає ефектів, etc.).

export const WIKI_REAGENTS = {
  'Незерський наріст': {
    title: 'Незерський наріст'
  },
  'Редстоуновий пил': {
    title: 'Редстоуновий пил'
  },
  "Світлокам'яний пил": {
    title: "Світлокам'яний пил"
  },
  'Оброблене павуче око': {
    title: 'Оброблене павуче око'
  },
  'Порох пломеня': {
    title: 'Порох пломеня'
  },
  'Цукор': {
    title: 'Цукор'
  },
  'Блискуча скибка кавуна': {
    title: 'Блискуча скибка кавуна'
  },
  'Магматичний крем': {
    title: 'Магматичний крем'
  },
  'Сльоза ґаста': {
    title: 'Сльоза ґаста'
  },
  'Золота морква': {
    title: 'Золота морква'
  },
  'Скелезуб': {
    title: 'Скелезуб'
  },
  'Кроляча лапка': {
    title: 'Кроляча лапка'
  },
  'Перетинка фантома': {
    title: 'Перетинка фантома'
  },
  'Павуче око': {
    title: 'Павуче око'
  },
  'Панцир черепахи': {
    title: 'Панцир черепахи',
    lore: '&7Коли на голові:\n&9+2 захисту'
  },
  'Слизовий блок': {
    title: 'Слизовий блок'
  },
  'Павутиння': {
    title: 'Павутиння'
  },
  'Камінь': {
    title: 'Камінь'
  },
  'Стрижень вітреня': {
    title: 'Стрижень вітреня'
  }
};

export const WIKI_POTIONS = {
  'water_bottle': {
    title: 'Пляшка води',
    minetip: '&7Немає ефектів'
  },
  'awkward': {
    title: 'Незграбне зілля',
    minetip: '&7Немає ефектів'
  },
  'mundane': {
    title: 'Звичайне зілля',
    minetip: '&7Немає ефектів'
  },
  'thick': {
    title: 'Густе зілля',
    minetip: '&7Немає ефектів'
  },
  'regeneration': {
    title: 'Зілля регенерації (0:45)',
    minetip: '&9Регенерація (0:45)',
    extendedMinetip: '&9Регенерація (1:30)',
    upgradedMinetip: '&9Регенерація II (0:22)'
  },
  'swiftness': {
    title: 'Зілля швидкости (3:00)',
    minetip: '&9Швидкість (3:00)',
    extendedMinetip: '&9Швидкість (8:00)',
    upgradedMinetip: '&9Швидкість II (1:30)'
  },
  'fire_resistance': {
    title: 'Зілля вогнестійкости (3:00)',
    minetip: '&9Вогнестійкість (3:00)',
    extendedMinetip: '&9Вогнестійкість (8:00)'
  },
  'healing': {
    title: 'Зілля зцілення',
    minetip: '&9Миттєве зцілення',
    upgradedMinetip: '&9Миттєве зцілення II'
  },
  'night_vision': {
    title: 'Зілля нічного бачення (3:00)',
    minetip: '&9Нічне бачення (3:00)',
    extendedMinetip: '&9Нічне бачення (8:00)'
  },
  'strength': {
    title: 'Зілля сили (3:00)',
    minetip: '&9Сила (3:00)',
    extendedMinetip: '&9Сила (8:00)',
    upgradedMinetip: '&9Сила II (1:30)'
  },
  'leaping': {
    title: 'Зілля стрибучости (3:00)',
    minetip: '&9Стрибучість (3:00)',
    extendedMinetip: '&9Стрибучість (8:00)',
    upgradedMinetip: '&9Стрибучість II (1:30)'
  },
  'water_breathing': {
    title: 'Зілля водяного дихання (3:00)',
    minetip: '&9Водяне дихання (3:00)',
    extendedMinetip: '&9Водяне дихання (8:00)'
  },
  'invisibility': {
    title: 'Зілля невидимости (3:00)',
    minetip: '&9Невидимість (3:00)',
    extendedMinetip: '&9Невидимість (8:00)'
  },
  'slow_falling': {
    title: 'Зілля повільного падіння (1:30)',
    minetip: '&9Повільне падіння (1:30)',
    extendedMinetip: '&9Повільне падіння (4:00)'
  },
  'poison': {
    title: 'Зілля отруєння (0:45)',
    minetip: '&cОтруєння (0:45)',
    extendedMinetip: '&cОтруєння (1:30)',
    upgradedMinetip: '&cОтруєння II (0:21)'
  },
  'weakness': {
    title: 'Зілля слабкости (1:30)',
    minetip: '&cСлабкість (1:30)',
    extendedMinetip: '&cСлабкість (4:00)'
  },
  'harming': {
    title: 'Зілля шкоди',
    minetip: '&cМиттєва шкода',
    upgradedMinetip: '&cМиттєва шкода II'
  },
  'slowness': {
    title: 'Зілля повільности (1:30)',
    minetip: '&cПовільність (1:30)',
    extendedMinetip: '&cПовільність (4:00)',
    upgradedMinetip: '&cПовільність IV (0:20)'
  },
  'oozing': {
    title: 'Зілля слизькости (3:00)',
    minetip: '&cСлизькість (3:00)'
  },
  'weaving': {
    title: 'Зілля плетіння (3:00)',
    minetip: '&cПлетіння (3:00)'
  },
  'infestation': {
    title: 'Зілля зараження (3:00)',
    minetip: '&cЗараження (3:00)'
  },
  'wind_charging': {
    title: 'Зілля вітряности (3:00)',
    minetip: '&cВітряність (3:00)'
  },
  'turtle_master': {
    title: 'Зілля майстра черепах (0:20)',
    minetip: '&cПовільність IV (0:20)\n&9Стійкість III (0:20)',
    extendedMinetip: '&cПовільність IV (0:40)\n&9Стійкість III (0:40)',
    upgradedMinetip: '&cПовільність VI (0:20)\n&9Стійкість IV (0:20)'
  }
};
