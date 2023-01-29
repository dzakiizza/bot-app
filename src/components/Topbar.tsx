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
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Image,
  Center,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import React from "react";
import { BiEditAlt, BiTrash } from "react-icons/bi";
import { mutate } from "swr";
import { RxHamburgerMenu } from "react-icons/rx";
import { MessageList } from "./Sidebar";
import useSWR from "swr";
import ModalBot from "./ModalBot";

function DrawerBar(props: {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const { data, error, mutate } = useSWR<BotInstance[]>(
    "/api/bots",
    async (endpoint: string) => {
      const response = await axios.get(endpoint);
      const result = await response.data;
      return result;
    }
  );
  const {
    isOpen: openModalBot,
    onOpen: onOpenModalBot,
    onClose: onCloseModalBot,
  } = useDisclosure();

  React.useEffect(() => {
    mutate();
  }, [data]);
  return (
    <Drawer isOpen={props.isOpen} placement="left" onClose={props.onClose}>
      <DrawerOverlay />
      <DrawerContent bg={"gray.900"}>
        <DrawerCloseButton color={"teal.400"} mt={2} />
        <DrawerHeader borderBottom={"1px solid"} borderColor={"gray.600"}>
          <Image src={"/assets/feedloopLight.svg"} width={"150px"} />
        </DrawerHeader>
        <DrawerBody>
          <Button
            w={"full"}
            my={5}
            p={4}
            bg={"teal.800"}
            _hover={{ bg: "teal.600" }}
            border={"1px solid"}
            borderColor={"teal.300"}
            color={"white"}
            onClick={onOpenModalBot}
          >
            New Bot
          </Button>
          <Flex
            overflowX={"scroll"}
            direction={"column"}
            sx={{ scrollbarWidth: "none" }}
            flex={1}
            align={"center"}
            w={"full"}
          >
            {data && !error ? (
              data.map((bot) => {
                return (
                  <MessageList key={bot.id} bot={bot} onClose={props.onClose} />
                );
              })
            ) : (
              <Center>
                <Spinner color={"white"} />
              </Center>
            )}
          </Flex>
        </DrawerBody>
        <ModalBot
          isOpen={openModalBot}
          onClose={onCloseModalBot}
          onCloseDrawer={props.onClose}
        />
      </DrawerContent>
    </Drawer>
  );
}

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
          mutate(`/api/bots?bot_id=${router.query.id}`);
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
              color={"white"}
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
  const {
    isOpen: openDeleteModal,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();

  const {
    isOpen: openEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure();

  const {
    isOpen: openDrawer,
    onOpen: onOpenDrawer,
    onClose: onCloseDrawer,
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
      <Flex align={"center"} gap={4}>
        <IconButton
          onClick={onOpenDrawer}
          display={{ base: "flex", md: "none" }}
          aria-label={"drawer-button"}
          bg={"gray.900"}
          color={"teal.400"}
          border={"1px solid"}
          borderColor={"teal.400"}
          width={"40px"}
          _active={{}}
          _hover={{}}
          icon={<RxHamburgerMenu />}
        />
        <Heading size={"md"} color={"gray.200"}>
          {props.botName || ""}
        </Heading>
      </Flex>
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
          onClick={onOpenDeleteModal}
          bg={"teal.800"}
          _hover={{ bg: "teal.600" }}
          border={"1px solid"}
          borderColor={"teal.300"}
        />
      </Flex>
      <ModalDelete isOpen={openDeleteModal} onClose={onCloseDeleteModal} />
      <ModalEdit
        isOpen={openEdit}
        onClose={onCloseEdit}
        botName={props.botName}
        botPrompt={props.botPrompt}
      />
      <DrawerBar
        isOpen={openDrawer}
        onClose={onCloseDrawer}
        onOpen={onOpenDrawer}
      />
    </Flex>
  );
}
