import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  // XP formula: quadratic curve tuned for engaging, satisfying progression
  const xpRequired = Math.round(30 * Math.pow(level, 1.65));
  const coinReward = Math.round(50 * Math.pow(level, 1.25));
  const gemReward = level % 5 === 0 ? 5 : level % 2 === 0 ? 2 : 1;

  const unlocks: LevelConfig['unlocks'] = {
    crops: [],
    buildings: [],
    animals: [],
    recipes: [],
    decorations: [],
    features: [],
  };

  switch (level) {
    case 1:
      unlocks.crops = ['wheat'];
      unlocks.buildings = ['bakery', 'feed_mill', 'chicken_coop', 'field_plot'];
      unlocks.animals = ['chicken'];
      unlocks.recipes = ['feed_chicken', 'bake_bread'];
      unlocks.decorations = ['wood_fence', 'dirt_path', 'red_tulips'];
      unlocks.features = ['Посадка культур', 'Сбор урожая', 'Кормление кур', 'Пекарня'];
      break;
    case 2:
      unlocks.crops = ['corn'];
      unlocks.buildings = ['dairy', 'cow_pasture'];
      unlocks.animals = ['cow'];
      unlocks.recipes = ['feed_cow', 'dairy_cream'];
      unlocks.decorations = ['white_fence', 'stone_path', 'yellow_daisies'];
      unlocks.features = ['Дойка коров', 'Молокозавод'];
      break;
    case 3:
      unlocks.crops = ['carrot'];
      unlocks.recipes = ['bake_corn_bread'];
      unlocks.decorations = ['stone_lamp', 'flower_barrel'];
      unlocks.features = ['Улучшение складов'];
      break;
    case 4:
      unlocks.crops = ['soybean'];
      unlocks.recipes = ['dairy_butter'];
      unlocks.decorations = ['wooden_bench', 'hay_bale'];
      break;
    case 5:
      unlocks.crops = ['sugarcane'];
      unlocks.buildings = ['sugar_mill', 'grill'];
      unlocks.recipes = ['sugar_brown', 'grill_pancake', 'bake_cookie'];
      unlocks.decorations = ['brick_path', 'small_fountain'];
      unlocks.features = ['Сахарный завод', 'Гриль-барбекю'];
      break;
    case 6:
      unlocks.crops = ['potato'];
      unlocks.buildings = ['pig_pen', 'pie_oven'];
      unlocks.animals = ['pig'];
      unlocks.recipes = ['feed_pig', 'dairy_cheese', 'pie_carrot'];
      unlocks.decorations = ['mud_puddle_deco', 'apple_crate'];
      unlocks.features = ['Свиноводство', 'Печь для пирогов'];
      break;
    case 7:
      unlocks.crops = ['tomato'];
      unlocks.buildings = ['juicer'];
      unlocks.recipes = ['sugar_white', 'grill_bacon_eggs', 'juice_carrot'];
      unlocks.decorations = ['garden_gnome', 'sunflower_planter'];
      unlocks.features = ['Соковыжималка'];
      break;
    case 8:
      unlocks.crops = ['strawberry'];
      unlocks.recipes = ['grill_roast_potato'];
      unlocks.decorations = ['cobblestone_path', 'rose_bush'];
      unlocks.features = ['Яблоневые сады', 'Расширение карты'];
      break;
    case 9:
      unlocks.crops = ['pumpkin'];
      unlocks.recipes = ['bake_muffin', 'pie_pumpkin', 'juice_apple'];
      unlocks.decorations = ['pumpkin_scarecrow', 'wooden_cart'];
      unlocks.features = ['Кусты малины'];
      break;
    case 10:
      unlocks.crops = ['cotton'];
      unlocks.buildings = ['loom', 'sheep_meadow', 'fishing_dock'];
      unlocks.animals = ['sheep'];
      unlocks.recipes = ['feed_sheep', 'loom_cotton_fabric', 'grill_hamburger', 'juice_tomato'];
      unlocks.decorations = ['pier_lantern', 'stone_well'];
      unlocks.features = ['Рыбалка', 'Овцеводство', 'Ткацкий станок'];
      break;
    case 11:
      unlocks.crops = ['chili'];
      unlocks.buildings = ['confectionery'];
      unlocks.recipes = ['sugar_syrup', 'loom_wool_yarn', 'pie_bacon', 'sweet_caramel'];
      unlocks.decorations = ['candyland_fence', 'candy_statue'];
      unlocks.features = ['Кондитерская', 'Вишнёвые сады'];
      break;
    case 12:
      unlocks.crops = ['rice'];
      unlocks.buildings = ['ice_cream_maker', 'sewing_shop'];
      unlocks.recipes = ['bake_pizza', 'ice_vanilla', 'sew_sweater', 'juice_cherry'];
      unlocks.decorations = ['ice_cream_cone_sculpture', 'marble_bench'];
      unlocks.features = ['Мороженица', 'Швейная мастерская'];
      break;
    case 13:
      unlocks.crops = ['lettuce'];
      unlocks.buildings = ['jam_maker'];
      unlocks.recipes = ['juice_lemonade', 'grill_fish', 'sweet_lollipop', 'ice_cherry_popsicle', 'jam_apple', 'sew_cotton_shirt'];
      unlocks.decorations = ['fruit_stand', 'wishing_well'];
      unlocks.features = ['Вареньеварня', 'Лимонные деревья'];
      break;
    case 14:
      unlocks.crops = ['onion'];
      unlocks.buildings = ['coffee_shop'];
      unlocks.recipes = ['bake_spicy_pizza', 'pie_apple', 'sew_warm_beanie', 'jam_raspberry', 'coffee_espresso'];
      unlocks.decorations = ['cafe_table', 'street_lamp_gold'];
      unlocks.features = ['Кофейня', 'Кофейные кусты'];
      break;
    case 15:
      unlocks.crops = ['garlic'];
      unlocks.recipes = ['bake_bagel', 'grill_veggies', 'juice_orange', 'sweet_toffee', 'ice_strawberry', 'jam_blackberry', 'coffee_cappuccino'];
      unlocks.decorations = ['grand_fountain', 'hedge_arch'];
      unlocks.features = ['Апельсиновые деревья'];
      break;
    case 16:
      unlocks.crops = ['sunflower'];
      unlocks.buildings = ['goat_yard'];
      unlocks.animals = ['goat'];
      unlocks.recipes = ['feed_goat', 'dairy_goat_cheese', 'sweet_chocolate', 'sew_dress', 'jam_cherry', 'coffee_hot_chocolate'];
      unlocks.decorations = ['goat_bell_statue', 'sunflower_arch'];
      unlocks.features = ['Козоводство', 'Какао-деревья'];
      break;
    case 17:
      unlocks.crops = ['cabbage'];
      unlocks.recipes = ['pie_fish', 'juice_berry_smoothie', 'sweet_cotton_candy', 'ice_chocolate_sundae', 'coffee_iced_latte'];
      unlocks.decorations = ['gazebo', 'topiary_peacock'];
      unlocks.features = ['Кусты черники'];
      break;
    case 18:
      unlocks.crops = ['grape'];
      unlocks.recipes = ['dairy_yogurt', 'coffee_mocha'];
      unlocks.decorations = ['grape_arbor', 'golden_harvester_statue'];
      unlocks.features = ['Персиковые деревья'];
      break;
    case 19:
      unlocks.crops = ['apple'];
      unlocks.recipes = ['jam_peach'];
      unlocks.decorations = ['golden_windmill', 'stone_bridge'];
      break;
    case 20:
      unlocks.crops = ['cherry'];
      unlocks.decorations = ['crystal_fountain', 'royal_garden_arch'];
      unlocks.features = ['Элитный статус фермы'];
      break;
    default:
      unlocks.decorations = [`trophy_level_${level}`, `flower_bed_${level % 4}`];
      unlocks.features = [`Бонус к опыту +${level * 2}%`, `Скидка на постройку ${level}%`];
      break;
  }

  return {
    level,
    xpRequired,
    coinReward,
    gemReward,
    unlocks,
  };
});
