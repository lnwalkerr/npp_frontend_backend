import customError from "./customError";

function hasRole(allowedPermission?: string) {
  const roleMiddleware = async (req, res, next): Promise<boolean> => {
    try {
      const user = req.admin;
      const agentRoles = ["admin", "member"];
      let role = user.userType.type

      if (role == "superAdmin" ) {
        next();
        return true;
      } else if (agentRoles.includes(role) && allowedPermission) {
        const permissionArray = allowedPermission.split(".");
        const module = permissionArray[0];
        const property = permissionArray[1];
        if (
          user &&
          user.adminUserPermission &&
          user.adminUserPermission[module] &&
          user.adminUserPermission[module][property]
        ) {
          next();
          return true;
        } else {
          throw new customError("You have not right to perform this action.");
        }
      } else {
        throw new customError("You have not right to perform this action.");
      }
    } catch (error) {
      next(error);
      return false;
    }
  };

  return roleMiddleware;
}
export default hasRole;
