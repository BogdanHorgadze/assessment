import supertest from 'supertest';

import { Api } from '../api';

export const fetchSlots = (api: Api, to: Date, from: Date): supertest.Test =>
  api.post('').send({
    query: `
      query Slots($to: DateTime!, $from: DateTime!) {
        slots(to: $to, from: $from) {
          doctorId
          start
          end
        }
      }
    `,
    variables: {
      to,
      from,
    },
  });
