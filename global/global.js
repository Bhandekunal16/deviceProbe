class Type {
  /** @type {string}*/
  query = ` MERGE (p:Person { deviceName: $deviceName, country: $country,
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
            deviceLongitude: $deviceLongitude 
            }) 
            RETURN p`;
}

module.exports = Type;
