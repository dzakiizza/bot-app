import { Center, Flex, IconButton, Input, Spinner } from "@chakra-ui/react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import React, { CSSProperties } from "react";
import axios from "axios";
import { BotInstance, ConversationInstance } from "@/interfaces/interface";
import useSWR from "swr";
import { useRouter } from "next/router";
import { BiSend } from "react-icons/bi";
import { PulseLoader } from "react-spinners";
import produce from "immer";

const override: CSSProperties = {
  display: "block",
  margin: "0 0 0 20px",
};

export default function Chat() {
  const router = useRouter();

  const [conversations, setConversations] = React.useState([
    {
      user_message: "",
      bot_message: "",
    },
  ]);

  const [inputMessage, setInputMessage] = React.useState("");
  const [completionLoading, setCompletionLoading] = React.useState(false);

  const {
    data: convo,
    error: errorConvo,
    isLoading: isConvoLoading,
    mutate: convoMutate,
    isValidating,
  } = useSWR(
    `/api/convo?bot_id=${router.query.id}`,
    async (endpoint: string) => {
      const response = await axios.get(endpoint);
      const result = await response.data;
      return result;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    }
  );

  React.useEffect(() => {
    convoMutate();
  }, [router.query.id]);

  const lastConversation = React.useMemo(() => {
    if (conversations) {
      return conversations.slice(-3);
    }
  }, [conversations]);

  const { data: bot, error: errorBot } = useSWR<BotInstance>(
    router.query.id ? `/api/bots?bot_id=${router.query.id}` : null,
    async (endpoint: string) => {
      const response = await axios.get(endpoint);
      const result = await response.data;
      return result;
    }
  );

  const handleSubmit = React.useCallback(async () => {
    try {
      setCompletionLoading(true);
      const result = await axios.post("/api/convo", {
        user_message: inputMessage,
        bot_id: router.query.id,
      });
      const completion = await getCompletion();
      const patch = await axios.patch(`/api/convo?convo_id=${result.data.id}`, {
        bot_message: completion,
      });
    } catch (err) {
      setCompletionLoading(false);
      console.log(err);
    }
  }, [inputMessage, router]);

  const getCompletion = React.useCallback(async () => {
    try {
      const result = await axios.post("/api/gpt", {
        prompt: bot?.prompt || "",
        text: inputMessage,
        lastConvo: lastConversation,
      });
      setConversations((state) =>
        produce(state, (draft) => {
          draft[state.length - 1].bot_message = `${result.data}`;
        })
      );
      setCompletionLoading(false);
      return result.data;
    } catch (err) {
      setCompletionLoading(false);
      console.log(err);
      return "";
    }
  }, [inputMessage, router, bot, lastConversation]);

  React.useEffect(() => {
    if (!convo) {
      setConversations([
        {
          user_message: "",
          bot_message: "",
        },
      ]);
    } else {
      setConversations(convo.data);
    }
  }, [convo]);

  return (
    <Flex h={"100vh"} bg={"gray.800"}>
      <Sidebar />
      <Flex flex={1} direction={"column"}>
        <Topbar botName={bot?.name} botPrompt={bot?.prompt} />
        <Flex
          flex={1}
          direction={"column"}
          pt={4}
          mx={5}
          overflowX={"scroll"}
          sx={{ scrollbarWidth: "none" }}
          gap={4}
        >
          {isConvoLoading || isValidating ? (
            <Center h={"100vh"}>
              <Spinner color={"white"} />
            </Center>
          ) : conversations ? (
            conversations.map((cht) => {
              return (
                <React.Fragment key={Math.random()}>
                  <Flex
                    display={!cht.user_message ? "none" : "flex"}
                    bg={"green.100"}
                    alignSelf={"flex-end"}
                    w={"fit-content"}
                    minW={"100px"}
                    borderRadius={"lg"}
                    p={"3"}
                    m={"1"}
                    justify={"center"}
                    color={"black"}
                  >
                    {cht.user_message}
                  </Flex>
                  <Flex
                    display={!cht.bot_message ? "none" : "flex"}
                    bg={"blue.100"}
                    alignSelf={"flex-start"}
                    w={"fit-content"}
                    minW={"100px"}
                    borderRadius={"lg"}
                    p={"3"}
                    m={"1"}
                    justify={"center"}
                    color={"black"}
                  >
                    {cht.bot_message}
                  </Flex>
                </React.Fragment>
              );
            })
          ) : (
            <Flex />
          )}
          {completionLoading && !isValidating && (
            <Flex>
              <PulseLoader
                cssOverride={override}
                color={"#36d7b7"}
                loading={completionLoading}
                size={10}
                aria-label="Loading Spinner"
              />
            </Flex>
          )}
        </Flex>
        <Flex
          h={"81px"}
          borderTop={"1px solid"}
          borderColor={"gray.600"}
          direction={"row"}
          align={"center"}
          bg={"gray.900"}
        >
          <Flex p={3} display={"flex"} flexDir={"row"} flex={1}>
            <Input
              color={"white"}
              _focus={{ borderColor: "teal.600" }}
              _focusVisible={{
                outline: "none",
              }}
              _hover={{ borderColor: "teal.600" }}
              placeholder="Type a message..."
              marginEnd={"3"}
              value={inputMessage}
              onChange={(event) => {
                setInputMessage(event.target.value);
              }}
              borderColor={"gray.600"}
            />
            <IconButton
              isDisabled={
                isConvoLoading || isValidating || completionLoading
                  ? true
                  : false
              }
              aria-label={"send-button"}
              icon={<BiSend color={"white"} />}
              bg={"teal.800"}
              _hover={{ bg: "teal.600" }}
              border={"1px solid"}
              borderColor={"teal.300"}
              onClick={() => {
                handleSubmit();
                setConversations((prev) => [
                  ...prev,
                  { user_message: inputMessage, bot_message: "" },
                ]);
                setInputMessage("");
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
