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
import { addDays, getDay, nextMonday, setHours, setMinutes } from 'date-fns';

import { AppointmentForm } from '@/components/AppointmentForm/AppointmentForm';
import DoctorSelector from '@/components/DoctorSelector';
import SlotSelector from '@/components/SlotSelector';
import {
  Doctor,
  Slot,
  useDoctorsQuery,
  useSlotsLazyQuery,
} from '@/generated/core.graphql';
import { SlotWithKey } from '@/types/domain';

const Appointments = () => {
  const from = useMemo(
    () => setMinutes(setHours(nextMonday(new Date()), 9), 0),
    []
  );
  const to = useMemo(() => addDays(from, 7), [from]);
  const [slots, setSlots] = useState<SlotWithKey[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>({} as Doctor);
  const [selectedSlot, setSelectedSlot] = useState<SlotWithKey>();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const minimumStartDate = new Date(slots?.[0]?.start);
  const maximumStartDate = minimumStartDate && addDays(minimumStartDate, 30);

  const { data, loading, error } = useDoctorsQuery();
  const [getSlots, { data: slotsData, loading: isLoadingSlots, refetch }] =
    useSlotsLazyQuery({
      variables: {
        doctorId: selectedDoctor?.id,
        to,
        from,
      },
    });

  const generateSlots = (slots: Partial<SlotWithKey>[] | undefined) =>
    slots?.map((slot, i) => ({
      key: i,
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
    async function fetchSlots() {
      if (selectedDoctor?.id) {
        const { data } = await getSlots();
        const slots = generateSlots(data?.slots);
        setSlots(slots as SlotWithKey[]);
      } else {
        setSlots([]);
      }
    }
    fetchSlots();
  }, [getSlots, selectedDoctor, slotsData?.slots]);

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
              selectedSlot={selectedSlot as Slot}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Appointments;
