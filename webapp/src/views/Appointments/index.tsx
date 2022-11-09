import { useState, useEffect, useMemo, useCallback } from 'react';

import {
  Heading,
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import {
  addDays,
  nextMonday,
  setHours,
  setMinutes,
} from 'date-fns';

import { AppointmentForm } from '@/components/AppointmentForm/AppointmentForm';
import DoctorSelector from '@/components/DoctorSelector';
import SlotSelector from '@/components/SlotSelector';
import {
  Doctor,
  useDoctorsQuery,
  useSlotsQuery,
} from '@/generated/core.graphql';
import { SlotWithKey } from '@/types/domain';

const Appointments = () => {
  const from = useMemo(
    () => setMinutes(setHours(addDays(nextMonday(new Date()), 1), 9), 0),
    []
  );
  const to = useMemo(() => addDays(from, 7), [from]);
  const { data, loading } = useDoctorsQuery();
  const {
    data: slotsData,
    loading: isLoadingSlots,
    refetch,
  } = useSlotsQuery({
    variables: {
      to,
      from,
    },
  });
  const [error, setError] = useState<string>();
  const [slots, setSlots] = useState<SlotWithKey[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>();
  const [selectedSlot, setSelectedSlot] = useState<SlotWithKey>(slots[0]);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const minimumStartDate = new Date(slots?.[0]?.start);
  const maximumStartDate = minimumStartDate && addDays(minimumStartDate, 30);

  const generateSlots = (slots: Partial<SlotWithKey>[] | undefined) =>
    slots?.map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
      ...slot,
    }));

  const onSlotSelect = useCallback(
    (slot: SlotWithKey) => {
      setSelectedSlot(slot);
      onOpen();
    },
    [onOpen]
  );


  useEffect(() => {
    if (selectedDoctor) {
      const slots = generateSlots(slotsData?.slots);
      setSlots(slots as SlotWithKey[]);
    } else {
      setSlots([]);
    }
  }, [selectedDoctor, slotsData?.slots]);

  return (
    <>
      <Box>
        <Heading>Appointments</Heading>
        {error && (
          <Box>
            <Text>{'error occured while loading doctors'}</Text>
          </Box>
        )}
        {loading && (
          <Box>
            <Text>{'loading...............'}</Text>
          </Box>
        )}
        <DoctorSelector
          doctors={data?.doctors as Doctor[]}
          value={selectedDoctor}
          onChange={setSelectedDoctor}
        />
        {slots?.length > 0 ? (
          <SlotSelector
            minimumStartDate={minimumStartDate}
            maximumStartDate={maximumStartDate}
            availableSlots={slots}
            value={selectedSlot}
            onChange={onSlotSelect}
            loadingSlots={isLoadingSlots}
          />
        ) : (
          <Text>No slots available</Text>
        )}
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Book An Appontment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AppointmentForm
              onClose={onClose}
              refetch={refetch}
              selectedSlot={selectedSlot}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Appointments;
