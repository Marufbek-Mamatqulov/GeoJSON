// Data processing script — generates public/data/*.json from raw GeoJSON
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'geoBoundaries-UZB-ADM2_simplified.geojson');
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');

// ── Province metadata ──────────────────────────────────────────────────────
const PROVINCES = [
  { id: 'karakalpakstan', nameUz: "Qoraqalpog'iston Respublikasi", nameRu: 'Республика Каракалпакстан', nameEn: 'Republic of Karakalpakstan', capitalUz: 'Nukus', capitalRu: 'Нукус', capitalEn: 'Nukus', capitalCoords: [59.62, 42.45], color: '#ef4444', order: 1 },
  { id: 'khorezm',        nameUz: 'Xorazm viloyati',               nameRu: 'Хорезмская область',          nameEn: 'Khorezm region',               capitalUz: 'Urganch',  capitalRu: 'Ургенч',    capitalEn: 'Urgench',   capitalCoords: [60.64, 41.55], color: '#f97316', order: 2 },
  { id: 'bukhara',        nameUz: 'Buxoro viloyati',                nameRu: 'Бухарская область',           nameEn: 'Bukhara region',               capitalUz: 'Buxoro',   capitalRu: 'Бухара',    capitalEn: 'Bukhara',   capitalCoords: [64.42, 39.78], color: '#eab308', order: 3 },
  { id: 'navoi',          nameUz: 'Navoiy viloyati',                nameRu: 'Навоийская область',          nameEn: 'Navoi region',                 capitalUz: 'Navoiy',   capitalRu: 'Навои',     capitalEn: 'Navoi',     capitalCoords: [65.37, 40.10], color: '#84cc16', order: 4 },
  { id: 'samarkand',      nameUz: 'Samarqand viloyati',             nameRu: 'Самаркандская область',       nameEn: 'Samarkand region',             capitalUz: 'Samarqand',capitalRu: 'Самарканд', capitalEn: 'Samarkand', capitalCoords: [66.97, 39.65], color: '#10b981', order: 5 },
  { id: 'kashkadarya',    nameUz: 'Qashqadaryo viloyati',           nameRu: 'Кашкадарьинская область',     nameEn: 'Kashkadarya region',           capitalUz: 'Qarshi',   capitalRu: 'Карши',     capitalEn: 'Karshi',    capitalCoords: [65.79, 38.86], color: '#06b6d4', order: 6 },
  { id: 'surkhandarya',   nameUz: 'Surxondaryo viloyati',           nameRu: 'Сурхандарьинская область',    nameEn: 'Surkhandarya region',          capitalUz: 'Termiz',   capitalRu: 'Термез',    capitalEn: 'Termez',    capitalCoords: [67.27, 37.22], color: '#3b82f6', order: 7 },
  { id: 'jizzakh',        nameUz: 'Jizzax viloyati',                nameRu: 'Джизакская область',          nameEn: 'Jizzakh region',               capitalUz: 'Jizzax',   capitalRu: 'Джизак',    capitalEn: 'Jizzakh',   capitalCoords: [67.83, 40.12], color: '#6366f1', order: 8 },
  { id: 'syrdarya',       nameUz: 'Sirdaryo viloyati',              nameRu: 'Сырдарьинская область',       nameEn: 'Syrdarya region',              capitalUz: 'Guliston', capitalRu: 'Гулистан',  capitalEn: 'Gulistan',  capitalCoords: [68.78, 40.49], color: '#8b5cf6', order: 9 },
  { id: 'tashkent',       nameUz: 'Toshkent viloyati',              nameRu: 'Ташкентская область',         nameEn: 'Tashkent region',              capitalUz: 'Nurafshon',capitalRu: 'Нурафшон',  capitalEn: 'Nurafshon', capitalCoords: [69.36, 41.05], color: '#ec4899', order: 10 },
  { id: 'tashkent-city',  nameUz: 'Toshkent shahri',                nameRu: 'город Ташкент',               nameEn: 'Tashkent city',                capitalUz: 'Toshkent', capitalRu: 'Ташкент',   capitalEn: 'Tashkent',  capitalCoords: [69.25, 41.30], color: '#f43f5e', order: 11 },
  { id: 'namangan',       nameUz: 'Namangan viloyati',              nameRu: 'Наманганская область',        nameEn: 'Namangan region',              capitalUz: 'Namangan', capitalRu: 'Наманган',  capitalEn: 'Namangan',  capitalCoords: [71.67, 41.00], color: '#14b8a6', order: 12 },
  { id: 'fergana',        nameUz: "Farg'ona viloyati",              nameRu: 'Ферганская область',          nameEn: 'Fergana region',               capitalUz: "Farg'ona", capitalRu: 'Фергана',   capitalEn: 'Fergana',   capitalCoords: [71.78, 40.38], color: '#0ea5e9', order: 13 },
  { id: 'andijan',        nameUz: 'Andijon viloyati',               nameRu: 'Андижанская область',         nameEn: 'Andijan region',               capitalUz: 'Andijon',  capitalRu: 'Андижан',   capitalEn: 'Andijan',   capitalCoords: [72.34, 40.78], color: '#a855f7', order: 14 },
];

// ── District → Province mapping ────────────────────────────────────────────
const DISTRICT_PROVINCE = {
  // Karakalpakstan
  'Amudarya':'karakalpakstan','Beruniy':'karakalpakstan','Chimbay':'karakalpakstan',
  'Ellikkala':'karakalpakstan','Karauzyak':'karakalpakstan','Kegeyli':'karakalpakstan',
  'Kanlikul':'karakalpakstan','Khojeyli':'karakalpakstan','Kungrad':'karakalpakstan',
  'Muynak':'karakalpakstan','Nukus':'karakalpakstan','Nukus city':'karakalpakstan',
  'Shumanay':'karakalpakstan','Takhtakupir':'karakalpakstan','Turtkul':'karakalpakstan',
  // Khorezm
  'Bagat':'khorezm','Gurlen':'khorezm','Khanka':'khorezm','Khazarasp':'khorezm',
  'Khiva':'khorezm','Khiva city':'khorezm','Koshkupir':'khorezm','Shavat':'khorezm',
  'Urgench':'khorezm','Urgench city':'khorezm','Yangibazar':'khorezm','Yangiarik':'khorezm',
  // Bukhara
  'Alat':'bukhara','Bukhara':'bukhara','Bukhara city':'bukhara','Gijduvan':'bukhara',
  'Jondor':'bukhara','Kagan':'bukhara','Kagan city':'bukhara','Karakul':'bukhara',
  'Karaulbazar':'bukhara','Peshku':'bukhara','Rаmitan':'bukhara','Shafirkan':'bukhara',
  'Vabkent':'bukhara',
  // Navoi
  'Kanimekh':'navoi','Karmana':'navoi','Khatirchi':'navoi','Kiziltepa':'navoi',
  'Navbakhor':'navoi','Navoi city':'navoi','Nurata':'navoi','Tamdi':'navoi',
  'Uchkuduk':'navoi','Zarafshan city':'navoi',
  // Samarkand
  'Akdarya':'samarkand','Bulungur':'samarkand','Dzhambay':'samarkand','Ishtikhan':'samarkand',
  'Kattakurgan':'samarkand','Kattakurgan city':'samarkand','Koshrabad':'samarkand',
  'Narpay':'samarkand','Nurabad':'samarkand','Pakhtachi':'samarkand','Pastdargom':'samarkand',
  'Payarik':'samarkand','Samarkand':'samarkand','Samarkand city':'samarkand',
  'Taylak':'samarkand','Urgut':'samarkand',
  // Kashkadarya
  'Chirakchi':'kashkadarya','Dehkanabad':'kashkadarya','Guzar':'kashkadarya',
  'Kamashi':'kashkadarya','Kasan':'kashkadarya','Kasbi':'kashkadarya',
  'Karshi':'kashkadarya','Karshi city':'kashkadarya','Kitab':'kashkadarya',
  'Mirishkar':'kashkadarya','Mubarek':'kashkadarya','Nishan':'kashkadarya',
  'Shakhrisabz':'kashkadarya','Shakhrisabz city':'kashkadarya','Yakkabag':'kashkadarya',
  // Surkhandarya
  'Altinsay':'surkhandarya','Angor':'surkhandarya','Baysun':'surkhandarya',
  'Denau':'surkhandarya','Dzharkurgan':'surkhandarya','Kizirik':'surkhandarya',
  'Kumkurgan':'surkhandarya','Muzrabad':'surkhandarya','Sariasiya':'surkhandarya',
  'Sherabad':'surkhandarya','Shurchi':'surkhandarya','Termez':'surkhandarya',
  'Termez city':'surkhandarya','Uzun':'surkhandarya',
  // Jizzakh
  'Arnasay':'jizzakh','Bakhmal':'jizzakh','Dustlik':'jizzakh','Dzhizak city':'jizzakh',
  'Farish':'jizzakh','Gallyaaral':'jizzakh','Mirzachul':'jizzakh','Paxtakor':'jizzakh',
  'Sharof Rashidov':'jizzakh','Yangiabad':'jizzakh','Zaаmin':'jizzakh',
  'Zafarabad':'jizzakh','Zarbdar':'jizzakh',
  // Syrdarya
  'Akaltin':'syrdarya','Bayaut':'syrdarya','Gulistan':'syrdarya','Gulistan city':'syrdarya',
  'Khavas':'syrdarya','Mirzaabad':'syrdarya','Sardoba':'syrdarya','Saykhunabad':'syrdarya',
  'Shirin city':'syrdarya','Sirdarya':'syrdarya','Yangiyer city':'syrdarya',
  // Tashkent province
  'Akhangaran':'tashkent','Akhangaran city':'tashkent','Akkurgan':'tashkent',
  'Almalik city':'tashkent','Angren city':'tashkent','Bekabad':'tashkent',
  'Bekabad city':'tashkent','Bostanlik':'tashkent','Buka':'tashkent',
  'Chinaz':'tashkent','Chirchik city':'tashkent','Kibray':'tashkent',
  'Kuyichirchik':'tashkent','Nurafshon city':'tashkent','Parkent':'tashkent',
  'Pskent':'tashkent','Urtachirchik':'tashkent','Yangiyul':'tashkent',
  'Yangiyul city':'tashkent','Yukarichirchik':'tashkent','Zangiata':'tashkent',
  // Tashkent city
  'Almazar':'tashkent-city','Bektemir':'tashkent-city','Chilanzar':'tashkent-city',
  'Mirabad':'tashkent-city','Mirzo Ulugbek':'tashkent-city','Sergeli':'tashkent-city',
  'Shaykhantokhur':'tashkent-city','Tashkent':'tashkent-city','Uchtepa':'tashkent-city',
  'Yakkasaray':'tashkent-city','Yangibazar':'khorezm','Yashnobod':'tashkent-city',
  'Yunusabad':'tashkent-city',
  // Namangan
  'Chartak':'namangan','Chust':'namangan','Kasansay':'namangan','Mingbulak':'namangan',
  'Namangan':'namangan','Namangan city':'namangan','Narin':'namangan','Pap':'namangan',
  'Turakurgan':'namangan','Uchkurgan':'namangan','Uychi':'namangan','Yangikurgan':'namangan',
  // Fergana
  'Altiarik':'fergana','Bagdad':'fergana','Besharik':'fergana','Buvayda':'fergana',
  'Dangara':'fergana','Fergana':'fergana','Fergana city':'fergana','Furkat':'fergana',
  'Kokand city':'fergana','Kuva':'fergana','Kuvasay city':'fergana','Kushtepa':'fergana',
  'Margilan city':'fergana','Rishtan':'fergana','Sokh':'fergana','Tashlak':'fergana',
  'Uchkuprik':'fergana','Uzbekistan':'fergana','Yazyavan':'fergana',
  // Andijan
  'Altinkul':'andijan','Andijan':'andijan','Andijan city':'andijan','Asaka':'andijan',
  'Balikchi':'andijan','Boz':'andijan','Bulakbashi':'andijan','Djalalkuduk':'andijan',
  'Izboskan':'andijan','Khadjaabad':'andijan','Khanabad city':'andijan',
  'Kurgantepa':'andijan','Markhamat':'andijan','Paxtaabad':'andijan',
  'Shakhrixan':'andijan','Ulugnar':'andijan',
};

// ── Multilingual translations ──────────────────────────────────────────────
const TRANSLATIONS = {
  'Amudarya':          { uz: 'Amudaryo',           ru: 'Амударья' },
  'Beruniy':           { uz: 'Beruniy',             ru: 'Беруний' },
  'Chimbay':           { uz: 'Chimboy',             ru: 'Чимбай' },
  'Ellikkala':         { uz: 'Ellikqala',           ru: 'Элликкала' },
  'Karauzyak':         { uz: "Qorao'zak",           ru: 'Кара-Узяк' },
  'Kegeyli':           { uz: 'Kegeyli',             ru: 'Кегейли' },
  'Kanlikul':          { uz: 'Qonlikul',            ru: 'Канликуль' },
  'Khojeyli':          { uz: "Xo'jayli",            ru: 'Ходжейли' },
  'Kungrad':           { uz: "Qo'ng'irot",          ru: 'Кунград' },
  'Muynak':            { uz: "Mo'ynoq",             ru: 'Муйнак' },
  'Nukus':             { uz: 'Nukus',               ru: 'Нукус' },
  'Nukus city':        { uz: 'Nukus shahri',        ru: 'г. Нукус' },
  'Shumanay':          { uz: 'Shumanay',            ru: 'Шуманай' },
  'Takhtakupir':       { uz: "Taxtako'pir",         ru: 'Тахтакупыр' },
  'Turtkul':           { uz: "To'rtko'l",           ru: 'Турткуль' },
  'Bagat':             { uz: "Bog'ot",              ru: 'Богот' },
  'Gurlen':            { uz: 'Gurlan',              ru: 'Гурлен' },
  'Khanka':            { uz: 'Xonqa',               ru: 'Ханка' },
  'Khazarasp':         { uz: 'Xazorasp',            ru: 'Хазарасп' },
  'Khiva':             { uz: 'Xiva',                ru: 'Хива' },
  'Khiva city':        { uz: 'Xiva shahri',         ru: 'г. Хива' },
  'Koshkupir':         { uz: "Qo'shko'pir",         ru: 'Кошкупыр' },
  'Shavat':            { uz: 'Shovot',              ru: 'Шават' },
  'Urgench':           { uz: 'Urganch',             ru: 'Ургенч' },
  'Urgench city':      { uz: 'Urganch shahri',      ru: 'г. Ургенч' },
  'Yangibazar':        { uz: 'Yangibozor',          ru: 'Янгибазар' },
  'Yangiarik':         { uz: 'Yangiariq',           ru: 'Янгиарык' },
  'Alat':              { uz: 'Olot',                ru: 'Алат' },
  'Bukhara':           { uz: 'Buxoro',              ru: 'Бухара' },
  'Bukhara city':      { uz: 'Buxoro shahri',       ru: 'г. Бухара' },
  'Gijduvan':          { uz: "G'ijduvon",           ru: 'Гиждуван' },
  'Jondor':            { uz: 'Jondor',              ru: 'Жондор' },
  'Kagan':             { uz: 'Kogon',               ru: 'Каган' },
  'Kagan city':        { uz: 'Kogon shahri',        ru: 'г. Каган' },
  'Karakul':           { uz: 'Qorakul',             ru: 'Каракуль' },
  'Karaulbazar':       { uz: 'Qorovulbozor',        ru: 'Каравулбазар' },
  'Peshku':            { uz: 'Peshku',              ru: 'Пешку' },
  'Rаmitan':           { uz: 'Romitan',             ru: 'Ромитан' },
  'Shafirkan':         { uz: 'Shofirkon',           ru: 'Шафиркан' },
  'Vabkent':           { uz: 'Vobkent',             ru: 'Вабкент' },
  'Kanimekh':          { uz: 'Qonimex',             ru: 'Канимех' },
  'Karmana':           { uz: 'Karmana',             ru: 'Кармана' },
  'Khatirchi':         { uz: 'Xatirchi',            ru: 'Хатырчи' },
  'Kiziltepa':         { uz: 'Qiziltepa',           ru: 'Кызылтепа' },
  'Navbakhor':         { uz: 'Navbahor',            ru: 'Навбахор' },
  'Navoi city':        { uz: 'Navoiy shahri',       ru: 'г. Навои' },
  'Nurata':            { uz: 'Nurota',              ru: 'Нурата' },
  'Tamdi':             { uz: 'Tomdi',               ru: 'Тамды' },
  'Uchkuduk':          { uz: 'Uchquduq',            ru: 'Учкудук' },
  'Zarafshan city':    { uz: 'Zarafshon shahri',    ru: 'г. Зарафшан' },
  'Akdarya':           { uz: 'Oqdaryo',             ru: 'Акдарья' },
  'Bulungur':          { uz: "Bulung'ur",           ru: 'Булунгур' },
  'Dzhambay':          { uz: 'Jomboy',              ru: 'Джамбай' },
  'Ishtikhan':         { uz: 'Ishtixon',            ru: 'Иштихан' },
  'Kattakurgan':       { uz: "Kattaqo'rg'on",       ru: 'Каттакурган' },
  'Kattakurgan city':  { uz: "Kattaqo'rg'on shahri",ru: 'г. Каттакурган' },
  'Koshrabad':         { uz: "Qo'shrabot",          ru: 'Кушрабад' },
  'Narpay':            { uz: 'Narpay',              ru: 'Нарпай' },
  'Nurabad':           { uz: 'Nurобод',             ru: 'Нурабад' },
  'Pakhtachi':         { uz: 'Paxtachi',            ru: 'Пахтачи' },
  'Pastdargom':        { uz: "Pastdarg'om",         ru: 'Пастдаргом' },
  'Payarik':           { uz: 'Payariq',             ru: 'Пайарык' },
  'Samarkand':         { uz: 'Samarqand',           ru: 'Самарканд' },
  'Samarkand city':    { uz: 'Samarqand shahri',    ru: 'г. Самарканд' },
  'Taylak':            { uz: 'Toyloq',              ru: 'Тайлак' },
  'Urgut':             { uz: 'Urgut',               ru: 'Ургут' },
  'Chirakchi':         { uz: 'Chiroqchi',           ru: 'Чиракчи' },
  'Dehkanabad':        { uz: 'Dehqonobod',          ru: 'Дехканабад' },
  'Guzar':             { uz: "G'uzor",              ru: 'Гузар' },
  'Kamashi':           { uz: 'Qamashi',             ru: 'Камаши' },
  'Kasan':             { uz: 'Qasan',               ru: 'Касан' },
  'Kasbi':             { uz: 'Kasbi',               ru: 'Касби' },
  'Karshi':            { uz: 'Qarshi',              ru: 'Карши' },
  'Karshi city':       { uz: 'Qarshi shahri',       ru: 'г. Карши' },
  'Kitab':             { uz: 'Kitob',               ru: 'Китаб' },
  'Mirishkar':         { uz: 'Mirishkor',           ru: 'Миришкор' },
  'Mubarek':           { uz: 'Muborak',             ru: 'Мубарек' },
  'Nishan':            { uz: 'Nishon',              ru: 'Нишан' },
  'Shakhrisabz':       { uz: 'Shahrisabz',          ru: 'Шахрисабз' },
  'Shakhrisabz city':  { uz: 'Shahrisabz shahri',   ru: 'г. Шахрисабз' },
  'Yakkabag':          { uz: "Yakkabog'",           ru: 'Яккабаг' },
  'Altinsay':          { uz: 'Oltinsoy',            ru: 'Алтынсай' },
  'Angor':             { uz: 'Angor',               ru: 'Ангор' },
  'Baysun':            { uz: 'Boysun',              ru: 'Байсун' },
  'Denau':             { uz: 'Denov',               ru: 'Денау' },
  'Dzharkurgan':       { uz: "Jarqo'rg'on",         ru: 'Джаркурган' },
  'Kizirik':           { uz: 'Qiziriq',             ru: 'Кизирик' },
  'Kumkurgan':         { uz: "Qumqo'rg'on",         ru: 'Кумкурган' },
  'Muzrabad':          { uz: 'Muzrabot',            ru: 'Музрабад' },
  'Sariasiya':         { uz: 'Sariosiyo',           ru: 'Сариасия' },
  'Sherabad':          { uz: 'Sherobod',            ru: 'Шерабад' },
  'Shurchi':           { uz: "Sho'rchi",            ru: 'Шурчи' },
  'Termez':            { uz: 'Termiz',              ru: 'Термез' },
  'Termez city':       { uz: 'Termiz shahri',       ru: 'г. Термез' },
  'Uzun':              { uz: 'Uzun',                ru: 'Узун' },
  'Arnasay':           { uz: 'Arnasoy',             ru: 'Арнасай' },
  'Bakhmal':           { uz: 'Baxmal',              ru: 'Бахмал' },
  'Dustlik':           { uz: "Do'stlik",            ru: 'Дустлик' },
  'Dzhizak city':      { uz: 'Jizzax shahri',       ru: 'г. Джизак' },
  'Farish':            { uz: 'Forish',              ru: 'Фориш' },
  'Gallyaaral':        { uz: "G'allaorol",          ru: 'Галляарал' },
  'Mirzachul':         { uz: "Mirzacho'l",          ru: 'Мирзачуль' },
  'Paxtakor':          { uz: 'Paxtakor',            ru: 'Пахтакор' },
  'Sharof Rashidov':   { uz: 'Sharof Rashidov',     ru: 'Шарофрашидов' },
  'Yangiabad':         { uz: 'Yangiobod',           ru: 'Янгиабад' },
  'Zaаmin':            { uz: 'Zomin',               ru: 'Зааминский' },
  'Zafarabad':         { uz: 'Zafarobod',           ru: 'Зафарабад' },
  'Zarbdar':           { uz: 'Zarbdor',             ru: 'Зарбдар' },
  'Akaltin':           { uz: 'Oqoltin',             ru: 'Акалтын' },
  'Bayaut':            { uz: 'Boyovut',             ru: 'Баяут' },
  'Chinaz':            { uz: 'Chinoz',              ru: 'Чиназ' },
  'Gulistan':          { uz: 'Guliston',            ru: 'Гулистан' },
  'Gulistan city':     { uz: 'Guliston shahri',     ru: 'г. Гулистан' },
  'Khavas':            { uz: 'Xovos',               ru: 'Хавас' },
  'Mirzaabad':         { uz: 'Mirzaobod',           ru: 'Мирзаабад' },
  'Sardoba':           { uz: 'Sardoba',             ru: 'Сардоба' },
  'Saykhunabad':       { uz: 'Sayxunobod',          ru: 'Сайхунабад' },
  'Shirin city':       { uz: 'Shirin shahri',       ru: 'г. Ширин' },
  'Sirdarya':          { uz: 'Sirdaryo',            ru: 'Сырдарья' },
  'Yangiyer city':     { uz: 'Yangiyer shahri',     ru: 'г. Янгиер' },
  'Akhangaran':        { uz: 'Ohangaron',           ru: 'Ахангаран' },
  'Akhangaran city':   { uz: 'Ohangaron shahri',    ru: 'г. Ахангаран' },
  'Akkurgan':          { uz: "Oqqo'rg'on",          ru: 'Аккурган' },
  'Almalik city':      { uz: 'Olmaliq shahri',      ru: 'г. Алмалык' },
  'Angren city':       { uz: 'Angren shahri',       ru: 'г. Ангрен' },
  'Bekabad':           { uz: 'Bekobod',             ru: 'Бекабад' },
  'Bekabad city':      { uz: 'Bekobod shahri',      ru: 'г. Бекабад' },
  'Bostanlik':         { uz: "Bo'stonliq",          ru: 'Бостанлык' },
  'Buka':              { uz: "Bo'ka",               ru: 'Бука' },
  'Chirchik city':     { uz: 'Chirchiq shahri',     ru: 'г. Чирчик' },
  'Kibray':            { uz: 'Qibray',              ru: 'Кибрай' },
  'Kuyichirchik':      { uz: 'Quyi Chirchiq',       ru: 'Куйичирчик' },
  'Nurafshon city':    { uz: 'Nurafshon shahri',    ru: 'г. Нурафшон' },
  'Parkent':           { uz: 'Parkent',             ru: 'Паркент' },
  'Pskent':            { uz: 'Piskent',             ru: 'Пскент' },
  'Urtachirchik':      { uz: "O'rta Chirchiq",      ru: 'Уртачирчик' },
  'Yangiyul':          { uz: "Yangiyo'l",           ru: 'Янгиюль' },
  'Yangiyul city':     { uz: "Yangiyo'l shahri",    ru: 'г. Янгиюль' },
  'Yukarichirchik':    { uz: 'Yuqori Chirchiq',     ru: 'Юкаричирчик' },
  'Zangiata':          { uz: 'Zangiota',            ru: 'Зангиата' },
  'Almazar':           { uz: 'Olmazar',             ru: 'Алмазар' },
  'Bektemir':          { uz: 'Bektemir',            ru: 'Бектемир' },
  'Chilanzar':         { uz: 'Chilonzor',           ru: 'Чиланзар' },
  'Mirabad':           { uz: 'Mirabad',             ru: 'Мирабад' },
  'Mirzo Ulugbek':     { uz: "Mirzo Ulug'bek",      ru: 'Мирзо Улугбек' },
  'Sergeli':           { uz: 'Sergeli',             ru: 'Сергели' },
  'Shaykhantokhur':    { uz: 'Shayxontohur',        ru: 'Шайхантахур' },
  'Tashkent':          { uz: 'Toshkent',            ru: 'Ташкент' },
  'Uchtepa':           { uz: 'Uchtepa',             ru: 'Учтепа' },
  'Yakkasaray':        { uz: 'Yakkasaroy',          ru: 'Яккасарай' },
  'Yashnobod':         { uz: 'Yashnobod',           ru: 'Яшнабад' },
  'Yunusabad':         { uz: 'Yunusobod',           ru: 'Юнусабад' },
  'Chartak':           { uz: 'Chortoq',             ru: 'Чартак' },
  'Chust':             { uz: 'Chust',               ru: 'Чуст' },
  'Kasansay':          { uz: 'Kosonsoy',            ru: 'Касансай' },
  'Mingbulak':         { uz: 'Mingbuloq',           ru: 'Мингбулак' },
  'Namangan':          { uz: 'Namangan',            ru: 'Наманган' },
  'Namangan city':     { uz: 'Namangan shahri',     ru: 'г. Наманган' },
  'Narin':             { uz: 'Norin',               ru: 'Норин' },
  'Pap':               { uz: 'Pop',                 ru: 'Поп' },
  'Turakurgan':        { uz: "Toraqqo'rg'on",       ru: 'Туракурган' },
  'Uchkurgan':         { uz: "Uchqo'rg'on",         ru: 'Учкурган' },
  'Uychi':             { uz: 'Uychi',               ru: 'Уйчи' },
  'Yangikurgan':       { uz: "Yangiqo'rg'on",       ru: 'Янгикурган' },
  'Altiarik':          { uz: 'Oltiariq',            ru: 'Алтыарык' },
  'Bagdad':            { uz: "Bag'dod",             ru: 'Багдад' },
  'Besharik':          { uz: 'Beshariq',            ru: 'Бешарык' },
  'Buvayda':           { uz: 'Buvayda',             ru: 'Бувайда' },
  'Dangara':           { uz: "Dang'ara",            ru: 'Дангара' },
  'Fergana':           { uz: "Farg'ona",            ru: 'Фергана' },
  'Fergana city':      { uz: "Farg'ona shahri",     ru: 'г. Фергана' },
  'Furkat':            { uz: 'Furqat',              ru: 'Фуркат' },
  'Kokand city':       { uz: "Qo'qon shahri",       ru: 'г. Коканд' },
  'Kuva':              { uz: 'Quva',                ru: 'Кува' },
  'Kuvasay city':      { uz: 'Quvasoy shahri',      ru: 'г. Кувасай' },
  'Kushtepa':          { uz: "Qushtepа",            ru: 'Куштепа' },
  'Margilan city':     { uz: "Marg'ilon shahri",    ru: 'г. Маргилан' },
  'Rishtan':           { uz: 'Rishton',             ru: 'Риштан' },
  'Sokh':              { uz: "So'x",                ru: 'Сох' },
  'Tashlak':           { uz: 'Toshloq',             ru: 'Ташлак' },
  'Uchkuprik':         { uz: "Uchko'prik",          ru: 'Учкуприк' },
  'Ulugnar':           { uz: "Ulug'nor",            ru: 'Улугнор' },
  'Uzbekistan':        { uz: "O'zbekiston",         ru: 'Узбекистан' },
  'Yazyavan':          { uz: 'Yazyovon',            ru: 'Язъяван' },
  'Altinkul':          { uz: "Oltinko'l",           ru: 'Алтынкуль' },
  'Andijan':           { uz: 'Andijon',             ru: 'Андижан' },
  'Andijan city':      { uz: 'Andijon shahri',      ru: 'г. Андижан' },
  'Asaka':             { uz: 'Asaka',               ru: 'Асака' },
  'Balikchi':          { uz: 'Baliqchi',            ru: 'Балыкчи' },
  'Boz':               { uz: "Bo'z",                ru: 'Боз' },
  'Bulakbashi':        { uz: 'Buloqboshi',          ru: 'Булакбаши' },
  'Djalalkuduk':       { uz: 'Jalolquduq',          ru: 'Джалалкудук' },
  'Izboskan':          { uz: 'Izboskan',            ru: 'Избаскан' },
  'Khadjaabad':        { uz: "Xo'jaobod",           ru: 'Ходжаабад' },
  'Khanabad city':     { uz: 'Xonobod shahri',      ru: 'г. Ханабад' },
  'Kurgantepa':        { uz: "Qo'rg'ontepa",        ru: 'Курганхепа' },
  'Markhamat':         { uz: 'Marhamat',            ru: 'Мархамат' },
  'Paxtaabad':         { uz: 'Paxtaobod',           ru: 'Пахтаабад' },
  'Shakhrixan':        { uz: 'Shahrixon',           ru: 'Шахрихан' },
};

// ── Helper: polygon centroid ───────────────────────────────────────────────
function centroid(geometry) {
  let xs = [], ys = [];
  const rings = geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat();
  for (const ring of rings) {
    for (const [x, y] of ring) { xs.push(x); ys.push(y); }
  }
  return [xs.reduce((a,b)=>a+b,0)/xs.length, ys.reduce((a,b)=>a+b,0)/ys.length];
}

// ── Process districts ──────────────────────────────────────────────────────
const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const enriched = {
  type: 'FeatureCollection',
  features: raw.features.map((f, idx) => {
    const en = f.properties.shapeName;
    const prov = DISTRICT_PROVINCE[en] || 'unknown';
    const t = TRANSLATIONS[en] || {};
    const center = centroid(f.geometry);
    return {
      ...f,
      id: `d-${idx}`,
      properties: {
        id: `d-${idx}`,
        nameEn: en,
        nameUz: t.uz || en,
        nameRu: t.ru || en,
        provinceId: prov,
        center,
      },
    };
  }),
};

// ── Cities data ────────────────────────────────────────────────────────────
const CITIES = [
  // Province capitals (already in PROVINCES) — also add as cities
  { id:'tashkent',   nameUz:'Toshkent',      nameRu:'Ташкент',      nameEn:'Tashkent',    province:'tashkent-city', coords:[69.25,41.30], isCapital:true,  isCountryCapital:true,  pop:2800000 },
  { id:'samarkand',  nameUz:'Samarqand',     nameRu:'Самарканд',    nameEn:'Samarkand',   province:'samarkand',     coords:[66.97,39.65], isCapital:true,  isCountryCapital:false, pop:540000  },
  { id:'namangan',   nameUz:'Namangan',      nameRu:'Наманган',     nameEn:'Namangan',    province:'namangan',      coords:[71.67,41.00], isCapital:true,  isCountryCapital:false, pop:600000  },
  { id:'andijan',    nameUz:'Andijon',       nameRu:'Андижан',      nameEn:'Andijan',     province:'andijan',       coords:[72.34,40.78], isCapital:true,  isCountryCapital:false, pop:450000  },
  { id:'nukus',      nameUz:'Nukus',         nameRu:'Нукус',        nameEn:'Nukus',       province:'karakalpakstan',coords:[59.62,42.45], isCapital:true,  isCountryCapital:false, pop:280000  },
  { id:'fergana',    nameUz:"Farg'ona",      nameRu:'Фергана',      nameEn:'Fergana',     province:'fergana',       coords:[71.78,40.38], isCapital:true,  isCountryCapital:false, pop:360000  },
  { id:'bukhara',    nameUz:'Buxoro',        nameRu:'Бухара',       nameEn:'Bukhara',     province:'bukhara',       coords:[64.42,39.78], isCapital:true,  isCountryCapital:false, pop:290000  },
  { id:'urgench',    nameUz:'Urganch',       nameRu:'Ургенч',       nameEn:'Urgench',     province:'khorezm',       coords:[60.64,41.55], isCapital:true,  isCountryCapital:false, pop:200000  },
  { id:'karshi',     nameUz:'Qarshi',        nameRu:'Карши',        nameEn:'Karshi',      province:'kashkadarya',   coords:[65.79,38.86], isCapital:true,  isCountryCapital:false, pop:260000  },
  { id:'termez',     nameUz:'Termiz',        nameRu:'Термез',       nameEn:'Termez',      province:'surkhandarya',  coords:[67.27,37.22], isCapital:true,  isCountryCapital:false, pop:140000  },
  { id:'jizzakh',    nameUz:'Jizzax',        nameRu:'Джизак',       nameEn:'Jizzakh',     province:'jizzakh',       coords:[67.83,40.12], isCapital:true,  isCountryCapital:false, pop:130000  },
  { id:'gulistan',   nameUz:'Guliston',      nameRu:'Гулистан',     nameEn:'Gulistan',    province:'syrdarya',      coords:[68.78,40.49], isCapital:true,  isCountryCapital:false, pop:65000   },
  { id:'navoi',      nameUz:'Navoiy',        nameRu:'Навои',        nameEn:'Navoi',       province:'navoi',         coords:[65.37,40.10], isCapital:true,  isCountryCapital:false, pop:130000  },
  { id:'nurafshon',  nameUz:'Nurafshon',     nameRu:'Нурафшон',     nameEn:'Nurafshon',   province:'tashkent',      coords:[69.36,41.05], isCapital:true,  isCountryCapital:false, pop:80000   },
  // Major non-capital cities
  { id:'margilan',   nameUz:"Marg'ilon",     nameRu:'Маргилан',     nameEn:'Margilan',    province:'fergana',       coords:[71.73,40.47], isCapital:false, isCountryCapital:false, pop:200000  },
  { id:'kokand',     nameUz:"Qo'qon",        nameRu:'Коканд',       nameEn:'Kokand',      province:'fergana',       coords:[70.93,40.53], isCapital:false, isCountryCapital:false, pop:230000  },
  { id:'chirchiq',   nameUz:'Chirchiq',      nameRu:'Чирчик',       nameEn:'Chirchiq',    province:'tashkent',      coords:[69.58,41.47], isCapital:false, isCountryCapital:false, pop:160000  },
  { id:'olmaliq',    nameUz:'Olmaliq',       nameRu:'Алмалык',      nameEn:'Almaliq',     province:'tashkent',      coords:[69.60,40.84], isCapital:false, isCountryCapital:false, pop:130000  },
  { id:'angren',     nameUz:'Angren',        nameRu:'Ангрен',       nameEn:'Angren',      province:'tashkent',      coords:[70.15,41.01], isCapital:false, isCountryCapital:false, pop:130000  },
  { id:'bekobod',    nameUz:'Bekobod',       nameRu:'Бекабад',      nameEn:'Bekabad',     province:'tashkent',      coords:[69.23,40.22], isCapital:false, isCountryCapital:false, pop:80000   },
  { id:'kattakurgan',nameUz:"Kattaqo'rg'on", nameRu:'Каттакурган',  nameEn:'Kattakurgan', province:'samarkand',     coords:[66.26,39.90], isCapital:false, isCountryCapital:false, pop:80000   },
  { id:'shahrisabz', nameUz:'Shahrisabz',    nameRu:'Шахрисабз',    nameEn:'Shakhrisabz', province:'kashkadarya',   coords:[66.83,39.05], isCapital:false, isCountryCapital:false, pop:100000  },
  { id:'khiva',      nameUz:'Xiva',          nameRu:'Хива',         nameEn:'Khiva',       province:'khorezm',       coords:[60.36,41.38], isCapital:false, isCountryCapital:false, pop:52000   },
  { id:'zarafshan',  nameUz:'Zarafshon',     nameRu:'Зарафшан',     nameEn:'Zarafshan',   province:'navoi',         coords:[64.19,41.51], isCapital:false, isCountryCapital:false, pop:75000   },
  { id:'denov',      nameUz:'Denov',         nameRu:'Денау',        nameEn:'Denau',       province:'surkhandarya',  coords:[67.81,38.31], isCapital:false, isCountryCapital:false, pop:65000   },
  { id:'muborak',    nameUz:'Muborak',       nameRu:'Мубарек',      nameEn:'Mubarek',     province:'kashkadarya',   coords:[65.47,39.24], isCapital:false, isCountryCapital:false, pop:30000   },
];

// ── Write output files ─────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });

fs.writeFileSync(
  path.join(OUT_DIR, 'districts.geojson'),
  JSON.stringify(enriched, null, 0)
);
console.log('✓ districts.geojson written:', enriched.features.length, 'features');

fs.writeFileSync(
  path.join(OUT_DIR, 'provinces.json'),
  JSON.stringify(PROVINCES, null, 2)
);
console.log('✓ provinces.json written:', PROVINCES.length, 'provinces');

fs.writeFileSync(
  path.join(OUT_DIR, 'cities.json'),
  JSON.stringify(CITIES, null, 2)
);
console.log('✓ cities.json written:', CITIES.length, 'cities');

// ── Verify mapping coverage ────────────────────────────────────────────────
const unmapped = enriched.features.filter(f => f.properties.provinceId === 'unknown');
if (unmapped.length) {
  console.warn('⚠ Unmapped districts:', unmapped.map(f => f.properties.nameEn).join(', '));
} else {
  console.log('✓ All districts mapped to provinces');
}
