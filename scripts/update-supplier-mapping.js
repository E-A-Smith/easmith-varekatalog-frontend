/**
 * Script to update supplier mapping from HTML option elements
 * Run with: node scripts/update-supplier-mapping.js
 */

const fs = require('fs');
const path = require('path');

// HTML options provided by user
const htmlOptions = `
        <option value="411622">3D Innovation Nordic AS</option>
        <option value="5043">3M Norge A/S</option>
        <option value="451179">3X WORKWEAR AS</option>
        <option value="103960">AB Golvabia NUF</option>
        <option value="100624">ADAX AS</option>
        <option value="451093">Add-On AS (O-Grill)</option>
        <option value="103073">Aduro AS</option>
        <option value="146">Ahlsell Norge AS</option>
        <option value="165">Alanor A/S</option>
        <option value="113732">Alloc AS</option>
        <option value="404142">Alvdal Skurlag AS</option>
        <option value="450058">AMIGA AB</option>
        <option value="200591">AS Wilfa</option>
        <option value="694614">Assa Abloy Opening Solutions</option>
        <option value="212">Auto Care International AS</option>
        <option value="216">Bayer AS</option>
        <option value="105617">Beha Elektro AS</option>
        <option value="412150">Beha Target AS</option>
        <option value="451123">Beha Target AS (USD)</option>
        <option value="135887">Benders Norge AS</option>
        <option value="450819">Bestun AS</option>
        <option value="501545">BEWI Building & Industry AS</option>
        <option value="102994">BEWI INSULATION NORGE AS</option>
        <option value="450571">Bjelin Sweden AB</option>
        <option value="252417">BMI Norge AS</option>
        <option value="450270">Boråstapeter Norge</option>
        <option value="5082">Bostik AS</option>
        <option value="101695">Boxon AS</option>
        <option value="102552">Brødr. Øyehaug AS</option>
        <option value="442021">Brødrene Dahl</option>
        <option value="737216">Brødrene Øyo AS</option>
        <option value="100569">BYGG 1 PRODUKTER AS</option>
        <option value="103611">Byggform A/S</option>
        <option value="108143">Byggma AS</option>
        <option value="108345">Byggma-Harmonigulv AS</option>
        <option value="450829">Char-Broil Europe GmbH Branc</option>
        <option value="105110">Charlie Storm Messel AS</option>
        <option value="109012">Combiwood Barkevik AS</option>
        <option value="450106">DANA LIM NORGE AS</option>
        <option value="106507">Dansani AS</option>
        <option value="9999">Diverse</option>
        <option value="200654">EASY ACCESS AS</option>
        <option value="451018">Ecovacs Europe GMBH</option>
        <option value="112001">ELEKTRONISKE TJENESTER AS</option>
        <option value="450869">Emil Lux Gmbh & Co KG Polen</option>
        <option value="759572">Emil Lux Gmbh & Co KG Tysklan</option>
        <option value="100315">Ergofast AS</option>
        <option value="465690">Ernex AS</option>
        <option value="102366">Espegard</option>
        <option value="102566">Essve Norge AS</option>
        <option value="501502">Fahrex AS (Tidl. Noah Garden</option>
        <option value="201046">Festival As</option>
        <option value="104500">Fibo Trespo AS</option>
        <option value="450261">FINSTAD ENGROS AS</option>
        <option value="441761">Fischer Norge AS</option>
        <option value="103131">Fiskars Norway AS</option>
        <option value="102521">Fjeldheim & Partners AS</option>
        <option value="425214">Flexit AS</option>
        <option value="101561">Flügger AS</option>
        <option value="106451">Forestia AS (Plater) Br.-foss</option>
        <option value="200839">FRITZØE ENGROS AS</option>
        <option value="6116">GERFLOR SCANDINAVIA AS</option>
        <option value="449468">Gjøco AS</option>
        <option value="449400">Gjøco-Harmoni AS</option>
        <option value="274410">Glava A/S</option>
        <option value="450994">GPBM Nordic AB</option>
        <option value="105504">GPBM Nordic AS</option>
        <option value="101236">GRANBERG AS</option>
        <option value="115130">Grantoppen AS</option>
        <option value="500572">Grohe AS NUF</option>
        <option value="106508">Grove-Knutsen & Co. AS</option>
        <option value="111348">Grønn Industri AS</option>
        <option value="750208">Gust. Alberts GmbH & Co KG</option>
        <option value="109524">Habo Norge AS</option>
        <option value="115280">Hako Ground & Garden AS</option>
        <option value="304751">Hamre AS</option>
        <option value="116372">Hanske- Companiet AS</option>
        <option value="103659">Harmonie Norge AS</option>
        <option value="450858">Hedgehog AS</option>
        <option value="10135">Helly Hansen AS</option>
        <option value="175">HEY DI AS</option>
        <option value="424757">Hikoki Power Tools Norway AS</option>
        <option value="750064">Hillerstorps Trä AB</option>
        <option value="750075">Hillerstorps Trä AB NOK</option>
        <option value="6090">Hultafors Group Norge AS</option>
        <option value="116475">Hunton Fiber AS</option>
        <option value="117768">Husqvarna Norge AS</option>
        <option value="201932">HVAL SJOKOLADEFABRIKK ASA</option>
        <option value="712817">Hyttetorget AS (Vera Miljø)</option>
        <option value="106101">Höganes Borgestad AS</option>
        <option value="771236">Hørby Bruk AB</option>
        <option value="5031">IBG AS</option>
        <option value="112463">Ide Decor Norge AS</option>
        <option value="109596">Industritre AS</option>
        <option value="101639">Inhouse Group AS</option>
        <option value="102585">Isekk AS</option>
        <option value="349933">Isola AS</option>
        <option value="364339">ITW CONSTRUCTION PRODUCTS AS</option>
        <option value="104570">Jabo Norge AS</option>
        <option value="114655">JELD-WEN NORGE AS (gml Vest W</option>
        <option value="102719">Jemtland AS</option>
        <option value="5035">Jotun AS</option>
        <option value="761254">Jowema AB</option>
        <option value="115190">Kahrs Norge A/S</option>
        <option value="207">Karcher A/S</option>
        <option value="101141">KEDDELL & BOMMEN AS</option>
        <option value="771140">Keter Plastic LTD</option>
        <option value="759192">Keter Poland Sp.Z o.o.</option>
        <option value="450923">KLIMABRANDS A/S</option>
        <option value="4501014">KNUDSEN KILEN A/S</option>
        <option value="210">Krefting & Co. A/S</option>
        <option value="440957">Krifon AS</option>
        <option value="450976">KRONUS SIA</option>
        <option value="450612">KYOCERA SENCO Norway AS</option>
        <option value="753131">Listo Asia Limited</option>
        <option value="104138">Litex AS</option>
        <option value="101938">LS Offset AS</option>
        <option value="100056">Luna Norge AS (Tidl.B&B Solut</option>
        <option value="114037">Løvenskiold-Handel AS</option>
        <option value="101129">MAKITA NORWAY</option>
        <option value="102956">Markslöjd AS</option>
        <option value="6098">MARS Norge AS</option>
        <option value="441927">Maske Emballasjefabrikk AS</option>
        <option value="450847">Maxi Import AS</option>
        <option value="451122">Meridian International Co. Lt</option>
        <option value="115363">Metabo Norge AS</option>
        <option value="451199">Metabo Sverige AB</option>
        <option value="451139">Mill International AS</option>
        <option value="110027">Mill International AS -tidl.</option>
        <option value="451001">Millarco International A/S</option>
        <option value="510872">Mintec Paper AS</option>
        <option value="109051">Moelven Wood AS</option>
        <option value="450920">MTD Products Nordic AB</option>
        <option value="501104">MYHRE MILJØPRODUKTER AS</option>
        <option value="10026">Møklegaard Print Shop AS</option>
        <option value="6058">NAMAS Vekst AS</option>
        <option value="201063">NATRE VINDUER AS</option>
        <option value="6163">Nelson Garden AS</option>
        <option value="200983">New Store Europe Norge AS</option>
        <option value="458236">Nibu AS</option>
        <option value="102645">Nilfisk-Alto div.av Nilfisk-A</option>
        <option value="112311">Nittedal Torvindustri A/S</option>
        <option value="450433">Nobia Norway AS / Norema Home</option>
        <option value="104833">Nobia Norway AS/Eurokit</option>
        <option value="102639">Noragent AS</option>
        <option value="6998">Norcolour AS</option>
        <option value="300300">Nordic Tools AS</option>
        <option value="104665">Nordpeis AS</option>
        <option value="102370">Norfolier GreenTec AS</option>
        <option value="482366">Norgips  Norge AS</option>
        <option value="116608">Norsk Wavin A/S</option>
        <option value="114138">Norvia AS</option>
        <option value="100088">O.B. Wiik AS</option>
        <option value="111449">O.Olsen Snekkerfabrikk AS</option>
        <option value="451074">OBI Group Sourcing GmbH</option>
        <option value="759574">OBI Group Sourcing Hong Kong</option>
        <option value="751515">OMC Barbecues (Ltd UK Filial)</option>
        <option value="450942">OONI GMBH</option>
        <option value="5041">Orkla House Care Norge AS</option>
        <option value="115297">Orthex Norway AS</option>
        <option value="102959">Osmo Nordic AS</option>
        <option value="219">Osram AS</option>
        <option value="105668">Palmako Norge AS</option>
        <option value="440832">Paroc AB</option>
        <option value="450268">PIACERE IMPORT AS</option>
        <option value="104416">Plastmo AS</option>
        <option value="784338">Poly Produkter AB</option>
        <option value="171800">POLYSEAM AS</option>
        <option value="450212">Primaverde B.V - NUF</option>
        <option value="330033">Profag AS</option>
        <option value="450085">PROTRE AS</option>
        <option value="451043">PROVIDA VARME AS</option>
        <option value="451133">Quicktool AS</option>
        <option value="105455">Rapp Bomek AS</option>
        <option value="115192">Relekta AS</option>
        <option value="775886">Renz AS (Tidl.Me-Fa AS)</option>
        <option value="113147">RKC A/S</option>
        <option value="450820">Rob Arnesen AS</option>
        <option value="159344">Robert Bosch AS</option>
        <option value="228737">Rockwool AS</option>
        <option value="787015">Rørets Industri AB</option>
        <option value="106393">S WOOD AS</option>
        <option value="494577">SAINT-GOBAIN BYGGEVARER AS</option>
        <option value="103007">Sandermoen AS</option>
        <option value="100146">Scanflex A/S</option>
        <option value="5010">Scanox A.S</option>
        <option value="102670">SCANPOLE AS</option>
        <option value="754144">Schou Norge AS  ( Euro )</option>
        <option value="116212">Schou Norge AS (NOK)</option>
        <option value="166">Sika Norge AS</option>
        <option value="104040">Sika Norge AS / Casco Schönox</option>
        <option value="753912">SIMPSON Strong-Tie A/S</option>
        <option value="110394">Simpson Strong-Tie Norge AS (</option>
        <option value="105734">Sioo Wood Protection Norge AS</option>
        <option value="608254">Skeisvoll & Co AS</option>
        <option value="105828">Smartpanel AS</option>
        <option value="440936">Smartpanel AS</option>
        <option value="116143">SNA EUROPE (NORWAY) AS</option>
        <option value="371262">Solør Skaft AS (Aktiv Eiendom</option>
        <option value="154768">STANLEY BLACK & DECKER NORWAY</option>
        <option value="106167">Steinhardt AS</option>
        <option value="6421">Steni AS</option>
        <option value="106108">Stiga AS (GGP Norge)</option>
        <option value="400500">Storeys AS</option>
        <option value="0">Supplier_0</option>
        <option value="105691">Surface Solutions AS</option>
        <option value="221150">Södra Wood AS - Harmoni</option>
        <option value="103308">Sørb ø Industribeslag AS</option>
        <option value="109982">Talgø Møretre AS</option>
        <option value="540143">Tarkett AB - NUF utl- uten MV</option>
        <option value="5017">Tarkett AS</option>
        <option value="100006">Teknikk AS</option>
        <option value="450359">Teltkongen AS</option>
        <option value="100077">THERMEX SCANDINAVIA AS</option>
        <option value="116242">Tolmer AS</option>
        <option value="625332">ToolMatic Norge AS</option>
        <option value="450363">Tufte Wear AS</option>
        <option value="574201">TUNDØREN AS</option>
        <option value="450822">U9Q-floors AS</option>
        <option value="105729">Uldal AS</option>
        <option value="450674">ULTRA GROUP LTD</option>
        <option value="510960">VIKING ARM AS</option>
        <option value="101682">Vilomix AS (tidl.Normin AS)</option>
        <option value="117276">Weber-Stephen Nordic</option>
        <option value="450633">WEDI GMBH</option>
        <option value="105530">Wilhelmsen Chemicals AS</option>
        <option value="510631">WJ Business Partner AS</option>
        <option value="103939">Woca Norge AS</option>
        <option value="103300">Aaltvedt Betong AS</option>
`;

function parseHtmlOptions(html) {
  const optionRegex = /<option value="(\d+)">(.*?)<\/option>/g;
  const suppliers = {};
  let match;
  
  while ((match = optionRegex.exec(html)) !== null) {
    const code = match[1];
    const name = match[2]
      .replace(/&amp;/g, '&')
      .replace(/&#248;/g, 'ø')
      .replace(/&#216;/g, 'Ø')
      .replace(/&#229;/g, 'å')
      .replace(/&#252;/g, 'ü')
      .replace(/&#228;/g, 'ä')
      .replace(/&nbsp;/g, ' ')
      .trim();
    
    // Only add if it's a valid supplier (skip special entries like "Supplier_0" and "Diverse")
    if (code !== '0' && code !== '9999' && name && !name.startsWith('Supplier_')) {
      suppliers[code] = {
        name: name,
        web_catalog_id: code
      };
    }
  }
  
  return suppliers;
}

// Parse the HTML and generate the mapping
const suppliers = parseHtmlOptions(htmlOptions);
const supplierCount = Object.keys(suppliers).length;

const mappingData = {
  metadata: {
    source: "Complete supplier list from Løvenskiold web catalog dropdown",
    extraction_date: new Date().toISOString().split('T')[0],
    mapping_updated: new Date().toISOString().split('T')[0],
    total_suppliers: supplierCount,
    match_rate: "100%",
    web_catalog_source: "https://varekatalog.lovenskiold.no/",
    description: "Complete mapping between Løvenskiold web catalog IDs and company names"
  },
  suppliers: suppliers
};

// Write to the mapping file
const filePath = path.join(__dirname, '..', 'docs', 'project', 'lovenskiold-supplier-mapping.json');
fs.writeFileSync(filePath, JSON.stringify(mappingData, null, 2));

console.log(`✅ Updated supplier mapping with ${supplierCount} suppliers`);
console.log(`📁 File: ${filePath}`);

// Display some sample entries
const sampleEntries = Object.entries(suppliers).slice(0, 5);
console.log('\n📋 Sample entries:');
sampleEntries.forEach(([code, data]) => {
  console.log(`  ${code}: ${data.name}`);
});