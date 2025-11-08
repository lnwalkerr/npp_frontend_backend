import { Server } from "./server";

let serverInstance = new Server();
const app = serverInstance.app;

let port = process.env.PORT || 5005;

export const myServer = app.listen(port, () => {
  console.log(`Aiims Dev Server:: Listening on PORT ${port}`);
  serverInstance.init();
});
