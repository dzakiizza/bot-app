import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useRouter } from "next/router";
import { KeyedMutator } from "swr";
import { BotInstance } from "@/interfaces/interface";

export default function ModalBot(props: {
  isOpen: boolean;
  onClose: () => void;
  mutate: KeyedMutator<BotInstance[]>;
}) {
  const [bot, setBot] = React.useState({ name: "", prompt: "" });
  const [isSubmitting, setIsSubmiting] = React.useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    try {
      setIsSubmiting(true);
      const result = await axios
        .post("/api/bots", {
          name: bot.name,
          prompt: bot.prompt,
        })
        .then((res) => {
          router.push(`/chat/${res.data.id}`);
          props.onClose();
          props.mutate();
        });
      setIsSubmiting(false);
    } catch (err) {
      setIsSubmiting(false);
      alert("There was an error");
    }
  };
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} size={"2xl"}>
      <ModalOverlay />
      <ModalContent bg={"gray.800"} borderRadius={"md"} color={"white"}>
        <ModalHeader bg={"gray.800"} borderRadius={"md"}>
          New Bot
        </ModalHeader>
        <ModalCloseButton />
        <Box>
          <ModalBody bg={"gray.800"}>
            <FormControl>
              <FormLabel>Bot name</FormLabel>
              <Input
                _focus={{ borderColor: "teal.600" }}
                _focusVisible={{
                  outline: "none",
                }}
                _hover={{ borderColor: "teal.600" }}
                borderColor={"gray.600"}
                placeholder="Bot name"
                onChange={(event) => {
                  setBot((prev) => ({ ...prev, name: event.target.value }));
                }}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Prompt</FormLabel>
              <Textarea
                _focus={{ borderColor: "teal.600" }}
                _focusVisible={{
                  outline: "none",
                }}
                _hover={{ borderColor: "teal.600" }}
                borderColor={"gray.600"}
                placeholder="Type a prompt..."
                onChange={(event) => {
                  setBot((prev) => ({ ...prev, prompt: event.target.value }));
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              bg={"teal.600"}
              _hover={{ bg: "teal.800" }}
              onClick={() => {
                onSubmit();
              }}
              colorScheme="blue"
              isDisabled={
                bot.name && bot.prompt && !isSubmitting ? false : true
              }
            >
              Submit
            </Button>
          </ModalFooter>
        </Box>
      </ModalContent>
    </Modal>
  );
}
