import * as moment from "moment-timezone";
import * as Bcrypt from "bcryptjs";
;
import customError from "../middlewares/customError";

export class Utils {

  // INDIAN TIMEZONE FOR ALL SCHEMAS
  public indianTimeZone = moment.tz(Date.now(), "Asia/Kolkata");

  static indianTimeZone() {
    return moment.tz(Date.now(), "Asia/Kolkata");
  }

  // Encrypt Password
  static encryptPassword(password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      Bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

  // Compare Password
  static async comparePassword(password: {
    plainPassword: string;
    encryptedPassword: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      Bcrypt.compare(
        password.plainPassword,
        password.encryptedPassword,
        (err, isSame) => {
          if (err) {
            reject(err);
          } else if (!isSame) {
            reject(new customError("Detail Does not Match"));
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  static async checkPassword(password, hash) {
    return await Bcrypt.compare(password, hash);
  }

}
