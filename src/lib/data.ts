import type { RegionModifier, Scenario } from "./model";

export interface Region {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Camera distance from the globe centre when focused. */
  zoom: number;
  /** Widely documented, verifiable background fact. */
  fact: string;
  /** Clearly fictional, illustrative storyline per scenario. */
  story: Record<Scenario, string>;
  modifier: RegionModifier;
}

export const REGIONS: Region[] = [
  {
    id: "amazon",
    name: "Амазония",
    lat: -3.5,
    lon: -62,
    zoom: 2.4,
    fact: "Крупнейший тропический лес планеты; бассейн Амазонки — крупнейший по площади речной бассейн мира.",
    story: {
      cooperation: "Иллюстрация: совместный мониторинг и восстановление лесов замедляют потерю экосистем.",
      confrontation: "Иллюстрация: ослабление охраны и мониторинга ускоряет деградацию лесов.",
    },
    modifier: { offset: { nature: 12 }, sensitivity: { nature: 1.4, resilience: 1.1 } },
  },
  {
    id: "himalaya",
    name: "Гималаи",
    lat: 28.0,
    lon: 86.9,
    zoom: 2.3,
    fact: "Здесь находится Эверест — 8848,86 м по совместному измерению Китая и Непала (2020).",
    story: {
      cooperation: "Иллюстрация: общая сеть наблюдения за ледниками помогает планировать водные ресурсы.",
      confrontation: "Иллюстрация: без обмена данными о ледниках растут риски для водоснабжения ниже по течению.",
    },
    modifier: { offset: { nature: 5, resilience: -6 }, sensitivity: { nature: 1.2, resilience: 1.3 } },
  },
  {
    id: "sahara",
    name: "Сахара",
    lat: 23.4,
    lon: 13,
    zoom: 2.6,
    fact: "Крупнейшая жаркая пустыня мира — около 9 млн км².",
    story: {
      cooperation: "Иллюстрация: совместные проекты солнечной энергетики и озеленения на окраинах пустыни.",
      confrontation: "Иллюстрация: нехватка воды и инвестиций усиливает уязвимость окружающих регионов.",
    },
    modifier: { offset: { nature: -10, quality: -8 }, sensitivity: { resilience: 1.3, quality: 1.2 } },
  },
  {
    id: "alps",
    name: "Альпы",
    lat: 46.5,
    lon: 10,
    zoom: 2.2,
    fact: "Горная дуга длиной около 1200 км проходит через восемь стран.",
    story: {
      cooperation: "Иллюстрация: трансграничная адаптация к отступлению ледников и смене сезонов.",
      confrontation: "Иллюстрация: разрозненные меры хуже справляются с таянием ледников и паводками.",
    },
    modifier: { offset: { quality: 14, science: 10 }, sensitivity: { nature: 1.1 } },
  },
  {
    id: "japan",
    name: "Япония",
    lat: 36.2,
    lon: 138.3,
    zoom: 2.3,
    fact: "Островное государство в сейсмически активной зоне на стыке нескольких тектонических плит.",
    story: {
      cooperation: "Иллюстрация: открытый обмен данными о землетрясениях и цунами усиливает готовность региона.",
      confrontation: "Иллюстрация: меньше совместных исследований — медленнее улучшаются системы раннего оповещения.",
    },
    modifier: { offset: { quality: 12, science: 14, resilience: 8 }, sensitivity: { resilience: 1.2 } },
  },
  {
    id: "reef",
    name: "Большой Барьерный риф",
    lat: -18.3,
    lon: 147.7,
    zoom: 2.3,
    fact: "Крупнейшая система коралловых рифов, более 2300 км вдоль Квинсленда; объект Всемирного наследия ЮНЕСКО с 1981 г.",
    story: {
      cooperation: "Иллюстрация: снижение нагрузок и наука о кораллах дают рифу больше шансов на восстановление.",
      confrontation: "Иллюстрация: повторяющиеся стрессы без скоординированных мер ухудшают состояние рифа.",
    },
    modifier: { offset: { nature: 8 }, sensitivity: { nature: 1.6 } },
  },
];

export interface City {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { id: "nyc", name: "Нью-Йорк", lat: 40.71, lon: -74.01 },
  { id: "london", name: "Лондон", lat: 51.51, lon: -0.13 },
  { id: "cairo", name: "Каир", lat: 30.04, lon: 31.24 },
  { id: "mumbai", name: "Мумбаи", lat: 19.08, lon: 72.88 },
  { id: "tokyo", name: "Токио", lat: 35.68, lon: 139.69 },
  { id: "nairobi", name: "Найроби", lat: -1.29, lon: 36.82 },
  { id: "saopaulo", name: "Сан-Паулу", lat: -23.55, lon: -46.63 },
  { id: "sydney", name: "Сидней", lat: -33.87, lon: 151.21 },
  { id: "paris", name: "Париж", lat: 48.86, lon: 2.35 },
  { id: "moscow", name: "Москва", lat: 55.76, lon: 37.62 },
  { id: "beijing", name: "Пекин", lat: 39.9, lon: 116.41 },
  { id: "delhi", name: "Дели", lat: 28.61, lon: 77.21 },
];

export interface Milestone {
  year: string;
  title: string;
  text: string;
  source: { label: string; url: string };
}

/** Completed, widely documented achievements. Verify wording against the source before citing. */
export const ACHIEVEMENTS: Milestone[] = [
  {
    year: "1980",
    title: "Искоренение натуральной оспы",
    text: "Всемирная ассамблея здравоохранения официально объявила оспу искоренённой — первая болезнь человека, побеждённая совместной глобальной программой вакцинации.",
    source: { label: "ВОЗ", url: "https://www.who.int/health-topics/smallpox" },
  },
  {
    year: "1987",
    title: "Монреальский протокол",
    text: "Соглашение о прекращении производства веществ, разрушающих озоновый слой. По научной оценке ВМО/ЮНЕП (2022), озоновый слой на пути к восстановлению.",
    source: { label: "ЮНЕП, секретариат по озону", url: "https://ozone.unep.org/" },
  },
  {
    year: "1988",
    title: "Глобальная инициатива по ликвидации полиомиелита",
    text: "С момента запуска инициативы число случаев дикого полиовируса сократилось более чем на 99%.",
    source: { label: "GPEI", url: "https://polioeradication.org/" },
  },
  {
    year: "2000",
    title: "Постоянное присутствие человека на МКС",
    text: "С ноября 2000 года Международная космическая станция непрерывно обитаема — совместный проект нескольких космических агентств.",
    source: { label: "NASA", url: "https://www.nasa.gov/international-space-station/" },
  },
  {
    year: "2003",
    title: "Проект «Геном человека»",
    text: "Международный консорциум завершил проект по секвенированию генома человека; данные были открыты для исследователей всего мира.",
    source: { label: "NHGRI", url: "https://www.genome.gov/human-genome-project" },
  },
  {
    year: "2011",
    title: "Искоренение чумы крупного рогатого скота",
    text: "FAO и Всемирная организация здоровья животных объявили чуму КРС искоренённой — вторая в истории искоренённая болезнь.",
    source: { label: "FAO", url: "https://www.fao.org/" },
  },
  {
    year: "2012",
    title: "Открытие бозона Хиггса",
    text: "Эксперименты ATLAS и CMS на Большом адронном коллайдере ЦЕРН объявили об обнаружении новой частицы, соответствующей бозону Хиггса.",
    source: { label: "CERN", url: "https://home.cern/science/physics/higgs-boson" },
  },
  {
    year: "2021",
    title: "Запуск телескопа «Джеймс Уэбб»",
    text: "Совместная обсерватория NASA, ESA и CSA, запущенная 25 декабря 2021 года.",
    source: { label: "NASA", url: "https://science.nasa.gov/mission/webb/" },
  },
];

/** Ongoing international initiatives whose status can be checked at the source. */
export const INITIATIVES: Milestone[] = [
  {
    year: "1988 →",
    title: "МГЭИК (IPCC)",
    text: "Межправительственная группа экспертов по изменению климата готовит оценочные доклады на основе опубликованных исследований.",
    source: { label: "IPCC", url: "https://www.ipcc.ch/" },
  },
  {
    year: "2000 →",
    title: "Gavi, Альянс по вакцинам",
    text: "Международное партнёрство по расширению доступа к вакцинам в странах с низким уровнем дохода.",
    source: { label: "Gavi", url: "https://www.gavi.org/" },
  },
  {
    year: "2008 →",
    title: "Всемирное семенохранилище на Шпицбергене",
    text: "Резервное хранилище образцов семян из генбанков мира.",
    source: { label: "Svalbard Global Seed Vault", url: "https://www.seedvault.no/" },
  },
  {
    year: "2015 →",
    title: "Парижское соглашение",
    text: "Климатическое соглашение в рамках РКИК ООН; страны представляют национальные вклады и отчитываются о прогрессе.",
    source: { label: "UNFCCC", url: "https://unfccc.int/process-and-meetings/the-paris-agreement" },
  },
  {
    year: "2021–2030",
    title: "Десятилетие ООН науки об океане",
    text: "Программа ЮНЕСКО-МОК по объединению океанологических исследований в интересах устойчивого развития.",
    source: { label: "Ocean Decade", url: "https://oceandecade.org/" },
  },
  {
    year: "2022 →",
    title: "Куньминско-Монреальская рамочная программа",
    text: "Глобальная рамочная программа по биоразнообразию, включая цель сохранить 30% суши и моря к 2030 году.",
    source: { label: "КБР ООН", url: "https://www.cbd.int/gbf" },
  },
  {
    year: "2023 →",
    title: "Соглашение об открытом море (BBNJ)",
    text: "Соглашение о сохранении морского биоразнообразия за пределами национальной юрисдикции, принятое в 2023 году.",
    source: { label: "ООН", url: "https://www.un.org/bbnj/" },
  },
  {
    year: "открытые данные",
    title: "Copernicus и NASA Earthdata",
    text: "Открытые программы данных наблюдения Земли, которыми может пользоваться любой исследователь.",
    source: { label: "Copernicus", url: "https://www.copernicus.eu/" },
  },
];

export interface DataSource {
  layer: string;
  title: string;
  date: string;
  origin: string;
  license: string;
  url: string;
}

/** Exact provenance of every texture shipped in /public/textures. */
export const TEXTURE_SOURCES: DataSource[] = [
  {
    layer: "Дневная поверхность",
    title: "Blue Marble: Next Generation with Topography and Bathymetry (January 2004, 5400×2700)",
    date: "Январь 2004; глобальная мозаика NASA Blue Marble Next Generation",
    origin: "NASA Earth Observatory / NASA Science",
    license: "Материалы NASA — общественное достояние; сохранять указание источника",
    url: "https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/",
  },
  {
    layer: "Ночные огни",
    title: "Earth at Night (Black Marble 2012)",
    date: "Данные Suomi NPP VIIRS за апрель и октябрь 2012; опубликовано 2012",
    origin: "NASA Earth Observatory (копия на Wikimedia Commons)",
    license: "Общественное достояние (NASA)",
    url: "https://commons.wikimedia.org/wiki/File:The_earth_at_night.jpg",
  },
  {
    layer: "Рельеф и маска океана",
    title: "Topography (srtm_ramp2), из него рассчитаны карта нормалей и маска океанического блеска",
    date: "NASA Earth Observatory, 2005",
    origin: "Reto Stöckli, NASA Earth Observatory, Visible Earth #73934 (копия на Wikimedia Commons)",
    license: "Общественное достояние (NASA)",
    url: "https://commons.wikimedia.org/wiki/File:Srtm_ramp2.world.21600x10800.jpg",
  },
  {
    layer: "Облака",
    title: "Solar System Scope — 2k Earth clouds (иллюстративный облачный слой, не снимок конкретного дня)",
    date: "2014",
    origin: "Solar System Scope (INOVE), на основе данных NASA",
    license: "CC BY 4.0",
    url: "https://commons.wikimedia.org/wiki/File:Solarsystemscope_texture_2k_earth_clouds.jpg",
  },
];