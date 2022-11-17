import supertest from "supertest";

import { Api } from "../api";

export const fetchSlots = (api: Api, doctorId: number, to: Date, from: Date): supertest.Test =>
  api.post("").send({
    query: `
    query Slots($to: DateTime!, $from: DateTime!, $doctorId: Float!) {
      slots(to: $to, from: $from, doctorId: $doctorId) {
        doctorId
        end
        start
      }
    }
    `,
    variables: {
      doctorId,
      to,
      from,
    },
  });
