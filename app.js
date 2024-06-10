const axios = require("axios");
class OsService {
  static async infoPrinter(ip) {
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      const info = response.data;

      if (response.status === 200) {
        return response.data.error ? response.data : info
      } else {
        console.log(
          `Failed to retrieve location information. Status code: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

}

module.exports = OsService;
