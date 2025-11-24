import { AuthConfig } from "convex/server";

export default {
    providers: [
        {
            domain: "https://unified-oyster-47.clerk.accounts.dev" ,
            applicationID: "convex",
        },
    ]
} satisfies AuthConfig;