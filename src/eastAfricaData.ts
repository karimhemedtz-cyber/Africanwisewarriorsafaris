/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParkGalleryImage {
  url: string;
  caption: string;
}

export interface Park {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  highlights: string[];
  bestTime: string;
  coverImage: string;
  gallery: ParkGalleryImage[];
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  capital: string;
  tagline: string;
  description: string;
  heroImage: string;
  parks: Park[];
}

export const countries: Country[] = [
  {
    id: 'tanzania',
    name: 'Tanzania',
    flag: '🇹🇿',
    capital: 'Dodoma',
    tagline: 'Home of the Great Migration',
    description: 'Tanzania is East Africa\'s crown jewel — a land of infinite savannahs, pristine wilderness and the most spectacular wildlife concentrations on Earth. From the endless plains of the Serengeti to the world\'s largest intact volcanic caldera at Ngorongoro, Tanzania offers once-in-a-lifetime experiences for the discerning traveller.',
    heroImage: '/src/assets/images/package_serengeti_1779964123153.png',
    parks: [
      {
        id: 'serengeti',
        name: 'Serengeti',
        country: 'Tanzania',
        tagline: 'The Great Migration Awaits',
        description: 'The Serengeti is synonymous with African wildlife. Spanning over 14,750 km², this UNESCO World Heritage Site hosts the greatest wildlife show on Earth — the Great Migration, where over 1.5 million wildebeests and 250,000 zebras follow the rains in an endless cycle of life and survival.',
        highlights: ['Great Wildebeest Migration', 'Big Five sightings', 'Balloon safaris at dawn', 'Maasai cultural encounters', 'Predator hunts on open plains'],
        bestTime: 'July – October (Migration river crossings)',
        coverImage: '/src/assets/images/package_serengeti_1779964123153.png',
        gallery: [
          { url: '/src/assets/images/package_serengeti_1779964123153.png', caption: 'Great Migration — wildebeests crossing the Mara River' },
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Golden hour over the Serengeti plains' },
          { url: '/src/assets/images/package_masaimara_1779964145785.png', caption: 'Lion pride resting in the afternoon sun' },
        ]
      },
      {
        id: 'ngorongoro',
        name: 'Ngorongoro',
        country: 'Tanzania',
        tagline: 'The Eighth Wonder of the World',
        description: 'Descend 600 metres into an ancient extinct volcano to discover one of Africa\'s most extraordinary ecosystems. The Ngorongoro Crater is a self-contained world sheltering over 25,000 large mammals including the endangered black rhinoceros, lions, elephants and flamingo-draped Lake Magadi.',
        highlights: ['Endangered black rhinoceros', 'Dense lion populations', 'Flamingo flocks at Lake Magadi', 'Maasai herders on the crater rim', 'Panoramic crater viewpoints'],
        bestTime: 'Year-round (best Jun – Oct)',
        coverImage: '/src/assets/images/package_ngorongoro_1779964167185.png',
        gallery: [
          { url: '/src/assets/images/package_ngorongoro_1779964167185.png', caption: 'Aerial view of the Ngorongoro Crater caldera' },
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Elephants roaming the crater floor' },
          { url: '/src/assets/images/package_serengeti_1779964123153.png', caption: 'Misty mornings on the crater rim' },
        ]
      },
      {
        id: 'tarangire',
        name: 'Tarangire',
        country: 'Tanzania',
        tagline: 'Land of Ancient Baobabs',
        description: 'Tarangire\'s dramatic landscape of giant baobab trees, seasonal swamps and the life-giving Tarangire River creates a wildlife Eden. During the dry season, thousands of elephants converge here making it one of the best elephant destinations in Africa.',
        highlights: ['Massive elephant herds', 'Ancient baobab forests', 'Tree-climbing lions', 'Over 550 bird species', 'Untouched wilderness feel'],
        bestTime: 'June – October (Dry Season)',
        coverImage: '/src/assets/images/safari_hero_1779964102826.png',
        gallery: [
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Ancient baobab trees against African sunset' },
          { url: '/src/assets/images/package_ngorongoro_1779964167185.png', caption: 'Elephant herd at the Tarangire River' },
          { url: '/src/assets/images/package_serengeti_1779964123153.png', caption: 'Vast open savannah at golden hour' },
        ]
      }
    ]
  },
  {
    id: 'kenya',
    name: 'Kenya',
    flag: '🇰🇪',
    capital: 'Nairobi',
    tagline: 'The Cradle of Safari',
    description: 'Kenya is the birthplace of the modern safari — a land of sweeping savannah, dramatic rift valleys and extraordinary biodiversity. The iconic Maasai Mara Reserve sets the gold standard for wildlife viewing, while Amboseli\'s backdrop of snow-capped Kilimanjaro creates images etched in memory forever.',
    heroImage: '/src/assets/images/package_masaimara_1779964145785.png',
    parks: [
      {
        id: 'masai-mara',
        name: 'Maasai Mara',
        country: 'Kenya',
        tagline: 'Africa\'s Greatest Wildlife Theatre',
        description: 'The Maasai Mara is Kenya\'s most celebrated wildlife reserve — an unbroken extension of the Serengeti ecosystem stretching across rolling golden grasslands. Home to the densest lion population in Africa, and the northern terminus of the Great Migration, the Mara delivers unmatched wildlife drama year-round.',
        highlights: ['Highest lion density in Africa', 'Annual Great Migration arrival (Jul–Oct)', 'Black-maned lions of the Mara', 'Hot air balloon safaris', 'Authentic Maasai warrior village visits'],
        bestTime: 'July – October (Migration)',
        coverImage: '/src/assets/images/package_masaimara_1779964145785.png',
        gallery: [
          { url: '/src/assets/images/package_masaimara_1779964145785.png', caption: 'Maasai Mara — lions at dawn patrol' },
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Sunset over the Mara River' },
          { url: '/src/assets/images/package_serengeti_1779964123153.png', caption: 'Wildebeests crossing into the Mara' },
        ]
      },
      {
        id: 'amboseli',
        name: 'Amboseli',
        country: 'Kenya',
        tagline: 'Elephants Against Kilimanjaro',
        description: 'Amboseli is renowned for its iconic vistas of free-roaming elephants silhouetted against the snow-capped peaks of Mount Kilimanjaro. The park\'s open, flat landscape makes it one of the best places in Africa for unobstructed wildlife photography and large elephant herd observations.',
        highlights: ['Elephants with Kilimanjaro backdrop', 'World-class wildlife photography', 'Large elephant family herds', 'Traditional Maasai communities', 'Diverse waterbird species'],
        bestTime: 'June – October & January – February',
        coverImage: '/src/assets/images/safari_hero_1779964102826.png',
        gallery: [
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Elephants with Mount Kilimanjaro at sunrise' },
          { url: '/src/assets/images/package_masaimara_1779964145785.png', caption: 'Elephant family crossing the dry lakebed' },
          { url: '/src/assets/images/package_ngorongoro_1779964167185.png', caption: 'Amboseli marshlands at golden hour' },
        ]
      },
      {
        id: 'tsavo',
        name: 'Tsavo',
        country: 'Kenya',
        tagline: 'Kenya\'s Largest Wild Frontier',
        description: 'Tsavo is Kenya\'s largest national park — a vast, rugged wilderness of red-dust elephants, dramatic lava flows and ancient riverbeds. Split into Tsavo East and Tsavo West, together they form one of the world\'s largest protected ecosystems, offering genuine off-the-beaten-path adventure.',
        highlights: ['Red-dust bull elephants', 'Mzima Springs crystal pools', 'Shetani lava fields', 'Lugard Falls gorge', 'Wilderness with very few tourists'],
        bestTime: 'June – September (Dry Season)',
        coverImage: '/src/assets/images/package_ngorongoro_1779964167185.png',
        gallery: [
          { url: '/src/assets/images/package_ngorongoro_1779964167185.png', caption: 'Tsavo\'s iconic red-dust elephant bulls' },
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Lugard Falls on the Galana River' },
          { url: '/src/assets/images/package_masaimara_1779964145785.png', caption: 'Open wilderness with Kilimanjaro in the distance' },
        ]
      }
    ]
  },
  {
    id: 'uganda',
    name: 'Uganda',
    flag: '🇺🇬',
    capital: 'Kampala',
    tagline: 'The Pearl of Africa',
    description: 'Winston Churchill called Uganda the Pearl of Africa — and it remains one of the continent\'s most underrated treasures. Uganda hosts half of the world\'s remaining mountain gorillas in the ancient Bwindi forest, spectacular chimpanzee tracking in Kibale, and the roaring Murchison Falls on the mighty Nile.',
    heroImage: '/src/assets/images/safari_hero_1779964102826.png',
    parks: [
      {
        id: 'bwindi',
        name: 'Bwindi',
        country: 'Uganda',
        tagline: 'Home of the Mountain Gorilla',
        description: 'Bwindi Impenetrable National Park is a UNESCO World Heritage Site and sanctuary for nearly half of the world\'s remaining mountain gorilla population. Trekking through the dense ancient rainforest to spend a precious hour with a gorilla family is considered one of the most profound wildlife encounters on Earth.',
        highlights: ['Mountain gorilla trekking', 'Half of world\'s mountain gorillas', 'Ancient 25,000-year-old forest', 'Over 350 bird species', 'Cultural encounters with Batwa pygmies'],
        bestTime: 'June – August & December – February',
        coverImage: '/src/assets/images/safari_hero_1779964102826.png',
        gallery: [
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Bwindi Impenetrable Forest at dawn mist' },
          { url: '/src/assets/images/package_ngorongoro_1779964167185.png', caption: 'Ancient forest canopy in Bwindi' },
          { url: '/src/assets/images/package_masaimara_1779964145785.png', caption: 'Misty valleys of the Bwindi highlands' },
        ]
      },
      {
        id: 'queen-elizabeth',
        name: 'Queen Elizabeth',
        country: 'Uganda',
        tagline: 'Tree-Climbing Lions & Hippo Channels',
        description: 'Queen Elizabeth National Park is Uganda\'s most popular safari destination, famed for its tree-climbing lions of the Ishasha sector and the spectacular Kazinga Channel boat safari — a narrow waterway linking two lakes that teems with the highest concentration of hippos and Nile crocodiles in East Africa.',
        highlights: ['Tree-climbing lions of Ishasha', 'Kazinga Channel boat safari', 'Largest hippo population', 'Chimpanzee tracking in Kyambura Gorge', 'Over 600 bird species'],
        bestTime: 'June – August & December – February',
        coverImage: '/src/assets/images/package_masaimara_1779964145785.png',
        gallery: [
          { url: '/src/assets/images/package_masaimara_1779964145785.png', caption: 'Tree-climbing lions of Ishasha sector' },
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Kazinga Channel sunset boat safari' },
          { url: '/src/assets/images/package_ngorongoro_1779964167185.png', caption: 'Hippos on the Kazinga Channel' },
        ]
      },
      {
        id: 'murchison-falls',
        name: 'Murchison Falls',
        country: 'Uganda',
        tagline: 'Most Powerful Waterfall on Earth',
        description: 'Murchison Falls National Park is Uganda\'s largest park, where the mighty Nile River is squeezed through a narrow 7-metre gorge with such force it creates what\'s regarded as the world\'s most powerful waterfall. Boat safaris to the base of the falls provide extraordinary wildlife encounters along the banks of the Nile.',
        highlights: ['Murchison Falls — world\'s most powerful', 'Nile boat safaris with wildlife', 'Large elephant herds', 'Rothschild giraffe sanctuary', 'Shoebill stork in the delta'],
        bestTime: 'December – February & June – September',
        coverImage: '/src/assets/images/package_ngorongoro_1779964167185.png',
        gallery: [
          { url: '/src/assets/images/package_ngorongoro_1779964167185.png', caption: 'Murchison Falls — the Nile squeezed through 7 metres' },
          { url: '/src/assets/images/safari_hero_1779964102826.png', caption: 'Boat safari on the Nile at sunset' },
          { url: '/src/assets/images/package_serengeti_1779964123153.png', caption: 'Giraffes on the Nile banks' },
        ]
      }
    ]
  }
];
