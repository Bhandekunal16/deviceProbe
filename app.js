class OsService {
  static async infoPrinter(ip) {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const info = await response.json();
      if (response.ok) return info.error ? info : info;
      else throw new Error(response.status);
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = OsService;
