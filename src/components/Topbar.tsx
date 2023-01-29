import { BotInstance } from "@/interfaces/interface";
import {
  Flex,
  Heading,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import React from "react";
import { BiEditAlt, BiTrash } from "react-icons/bi";
import { mutate } from "swr";

function ModalEdit(props: {
  isOpen: boolean;
  onClose: () => void;
  botName: string | undefined;
  botPrompt: string | undefined;
}) {
  const [bot, setBot] = React.useState<Pick<BotInstance, "name" | "prompt">>({
    name: "",
    prompt: "",
  });
  const [isSubmitting, setIsSubmiting] = React.useState(false);
  const [isTouched, setIsTouched] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setBot({ name: props.botName || "", prompt: props.botPrompt || "" });
  }, [props]);

  const onSubmit = async () => {
    try {
      setIsSubmiting(true);
      const result = await axios
        .patch(`/api/bots?bot_id=${router.query.id}`, {
          name: bot.name,
          prompt: bot.prompt,
        })
        .then((res) => {
          props.onClose();
          mutate("/api/bots");
          mutate(`/api/bots?bot_id=${router.query.id}`)
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
          Edit Bot
        </ModalHeader>
        <ModalCloseButton />
        <Box>
          <ModalBody bg={"gray.800"}>
            <FormControl>
              <FormLabel>Bot name</FormLabel>
              <Input
                onClick={() => {
                  setIsTouched(true);
                }}
                value={bot.name}
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
                onClick={() => {
                  setIsTouched(true);
                }}
                value={bot.prompt}
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
                bot.name && bot.prompt && !isSubmitting && isTouched
                  ? false
                  : true
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

function ModalDelete(props: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();

  const handleDeleteClick = React.useCallback(async () => {
    try {
      const del = await axios.delete(`/api/bots?bot_id=${router.query.id}`);
      router.push("/");
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent bg={"gray.800"} borderRadius={"md"} color={"white"}>
        <ModalHeader bg={"gray.800"} borderRadius={"md"}>
          Are you sure want to delete ?
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>This action will permanently delete the bot</ModalBody>
        <ModalFooter>
          <Flex gap={4}>
            <Button
              variant="ghost"
              onClick={props.onClose}
              _hover={{}}
              _active={{}}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                handleDeleteClick();
                mutate("/api/bots");
                props.onClose();
              }}
              color={"red"}
              borderColor={"red"}
              _hover={{ bg: "gray.800" }}
            >
              Delete
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function Topbar(props: {
  botName: string | undefined;
  botPrompt: string | undefined;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: openEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure();

  return (
    <Flex
      bg={"gray.900"}
      h={"81px"}
      w={"100%"}
      align={"center"}
      p={"5"}
      justify={"space-between"}
      borderBottom={"1px solid"}
      borderColor={"gray.600"}
    >
      <Heading size={"md"} color={"gray.200"}>
        {props.botName || ""}
      </Heading>
      <Flex gap={4}>
        <IconButton
          display={props.botName || props.botPrompt ? "flex" : "none"}
          aria-label={""}
          onClick={onOpenEdit}
          icon={<BiEditAlt color={"white"} />}
          bg={"teal.800"}
          _hover={{ bg: "teal.600" }}
          border={"1px solid"}
          borderColor={"teal.300"}
        />
        <IconButton
          display={props.botName || props.botPrompt ? "flex" : "none"}
          aria-label={""}
          icon={<BiTrash color={"white"} />}
          onClick={onOpen}
          bg={"teal.800"}
          _hover={{ bg: "teal.600" }}
          border={"1px solid"}
          borderColor={"teal.300"}
        />
      </Flex>
      <ModalDelete isOpen={isOpen} onClose={onClose} />
      <ModalEdit
        isOpen={openEdit}
        onClose={onCloseEdit}
        botName={props.botName}
        botPrompt={props.botPrompt}
      />
    </Flex>
  );
}
function useSWR<T>(
  arg0: string,
  arg1: (endpoint: string) => Promise<any>
): { data: any; error: any; mutate: any } {
  throw new Error("Function not implemented.");
}
