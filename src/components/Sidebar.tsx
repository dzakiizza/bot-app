import {
  Avatar,
  Button,
  Flex,
  Icon,
  IconButton,
  Image,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { BiChevronRight, BiLogOut } from "react-icons/bi";
import ModalBot from "./ModalBot";
import { BotInstance } from "@/interfaces/interface";
import useSWR from "swr";
import { useRouter } from "next/router";

const MessageList = (props: { bot: BotInstance }) => {
  const router = useRouter();

  return (
    <Flex
      p={"3"}
      align={"center"}
      w={"90%"}
      _hover={{ bg: "gray.700", cursor: "pointer" }}
      border={"1px solid"}
      borderColor={router.query.id === props.bot.id ? "teal.600" : "gray.900"}
      onClick={() => {
        router.push(`/chat/${props.bot.id}`);
      }}
      borderRadius={"md"}
    >
      <Flex align={"center"} justify={"space-between"} flex={1}>
        <Text color={"gray.200"}>{props.bot.name}</Text>{" "}
        <Icon as={BiChevronRight} color={"gray.200"} />
      </Flex>
    </Flex>
  );
};

export default function Sidebar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, error, mutate } = useSWR<BotInstance[]>(
    "/api/bots",
    async (endpoint: string) => {
      const response = await axios.get(endpoint);
      const result = await response.data;
      return result;
    }
  );

  React.useEffect(() => {
    mutate();
  }, [data]);

  return (
    <Flex
      h={"100vh"}
      w={"420px"}
      borderEnd={"1px solid"}
      borderColor={"gray.600"}
      direction={"column"}
      bg={"gray.900"}
    >
      <Flex
        h={"81px"}
        w={"100%"}
        align={"center"}
        p={3}
        borderBottom={"1px solid"}
        borderColor={"gray.600"}
        justify={"space-between"}
      >
        <Image src={"/assets/feedloopLight.svg"} width={"150px"} />
      </Flex>
      <Button
        m={5}
        p={4}
        onClick={onOpen}
        bg={"teal.800"}
        _hover={{ bg: "teal.600" }}
        border={"1px solid"}
        borderColor={"teal.300"}
        color={"white"}
      >
        New Bot
      </Button>
      <ModalBot isOpen={isOpen} onClose={onClose} mutate={mutate} />
      <Flex
        overflowX={"scroll"}
        direction={"column"}
        sx={{ scrollbarWidth: "none" }}
        flex={1}
        align={"center"}
      >
        {data &&
          !error &&
          data.map((bot) => {
            return <MessageList key={bot.id} bot={bot} />;
          })}
      </Flex>
    </Flex>
  );
}
