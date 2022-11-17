import React, { FC } from 'react';

import { ApolloQueryResult } from '@apollo/client';
import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldValues, useForm } from 'react-hook-form';
import * as yup from 'yup';

import {
  Slot,
  SlotsQuery,
  useBookAppointmentMutation,
} from '@/generated/core.graphql';

const schema = yup
  .object({
    patientName: yup.string().required(),
  })
  .required();

interface Props {
  onClose: () => void;
  refetch: () => Promise<ApolloQueryResult<SlotsQuery>>;
  selectedSlot: Slot;
}

export const AppointmentForm: FC<Props> = ({
  onClose,
  refetch,
  selectedSlot,
}) => {
  const [bookAppointment, { loading: addingAppointments, error }] = useBookAppointmentMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const sendAppointment = async (data: FieldValues) => {
    try {
      const { doctorId, start, end } = selectedSlot;
      await bookAppointment({
        variables: {
          bookAppointmentInput: {
            slot: { doctorId, start, end },
            patientName: data.patientName,
            description: data.description,
          },
        },
      });
      await refetch();
      onClose();
    } catch (ex) {
      console.log(ex);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    await sendAppointment(data);
  });

  return (
    <form onSubmit={onSubmit} className='appointmentModal'>
      <Flex align='center' justify='center' p='15' flexDir='column'>
        <Input
          mb='15'
          {...register('patientName')}
          placeholder='enter your name'
        />
        <Text color='red'>
          {errors?.patientName && (errors.patientName.message as string)}
        </Text>
        <Input
          mb='15'
          {...register('description')}
          placeholder='You can add description here'
        />

        {error && (
          <Box>
            <Text color='red'>{error.message}</Text>
          </Box>
        )}

        <Box>
          <Button mr='20' type='button' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' isLoading={addingAppointments}>
            Submit
          </Button>
        </Box>
      </Flex>
    </form>
  );
};
