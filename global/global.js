class NEO4JQUERY {
  query;
  matchProfile;
  matchPerson;
  editProfile;
  serverChecker;

  constructor() {
    this.query = ` MERGE (p:Person { deviceName: $deviceName, country: $country,
            country_name: $country_name,
            country_code: $country_code,
            country_code_iso3: $country_code_iso3,
            country_capital: $country_capital,
            country_tld: $country_tld,
            continent_code: $continent_code,
            in_eu: false,
            postal: $postal,
            latitude: $latitude,
            longitude: $longitude,
            timezone: $timezone,
            utc_offset: $utc_offset,
            country_calling_code: $country_calling_code,
            currency: $currency,
            currency_name: $currency_name,
            languages: $languages,
            country_area: $country_area,
            country_population: $country_population,
            asn: $asn,
            org: $org,
            ip: $ip,
            network: $network, 
            version: $version, 
            city: $city, 
            region: $region, 
            region_code: $region_code,
            deviceLatitude: $deviceLatitude,
            deviceLongitude: $deviceLongitude,
            os : $os
            }) 
            RETURN p`;

    this.matchProfile = `MATCH (p: profile) RETURN COLLECT(properties(p)) as Person`;
    this.matchPerson = `MATCH (p:Person) RETURN COLLECT(properties(p)) as Person`;
    this.editProfile = `MATCH (m: profile {type : "admin" }) set m.status = $status return collect(properties(m)) as User`;
    this.serverChecker = `<h1>Hello world</h1>`;
  }

  method(obj, requestData, deviceName, os) {
    return {
      ip: obj.ip,
      network: obj.network,
      version: obj.version,
      city: obj.city,
      region: obj.region,
      region_code: obj.region_code,
      country: obj.country,
      country_name: obj.country_name,
      country_code: obj.country_code,
      country_code_iso3: obj.country_code_iso3,
      country_capital: obj.country_capital,
      country_tld: obj.country_tld,
      continent_code: obj.continent_code,
      in_eu: false,
      postal: obj.postal,
      latitude: obj.latitude,
      longitude: obj.longitude,
      timezone: obj.timezone,
      utc_offset: obj.utc_offset,
      country_calling_code: obj.country_calling_code,
      currency: obj.currency,
      currency_name: obj.currency_name,
      languages: obj.languages,
      country_area: obj.country_area,
      country_population: obj.country_population,
      asn: obj.asn,
      org: obj.org,
      deviceName: deviceName,
      deviceLatitude: requestData.deviceLatitude,
      deviceLongitude: requestData.deviceLongitude,
      os: os,
    };
  }

  serverGrating(port) {
    return `Server is up and running at http://localhost:${port}`;
  }
}

module.exports = NEO4JQUERY;
