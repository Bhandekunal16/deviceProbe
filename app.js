const axios = require("axios");
class OsService {
  static async infoPrinter(ip) {
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      const info = response.data;
      return response.status === 200
        ? response.data.error
          ? response.data
          : info
        : new Error(
            `Failed to retrieve location information. Status code: ${response.status}`
          );
    } catch (error) {
      new Error(error);
    }
  }
}
module.exports = OsService;
