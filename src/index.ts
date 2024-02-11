import { server } from "./server";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 4000;
export const listen = server.listen(PORT, () =>
  console.log(`Server's running on port ${PORT}`)
);
