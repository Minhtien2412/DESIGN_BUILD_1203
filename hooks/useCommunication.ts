/**
 * Communication & Collaboration Hooks
 * State management for messaging, calls, and meetings
 */

import {
    addReaction,
    createChannel,
    createMeeting,
    createPoll,
    deleteChannel,
    deleteMeeting,
    deleteMessage,
    getChannel,
    getChannels,
    getMeeting,
    getMeetings,
    getMessages,
    markAsRead,
    respondToMeeting,
    sendMessage,
    updateChannel,
    updateMeeting,
    updateMessage,
    votePoll,
} from '@/services/communication';
import {
    Channel,
    ChannelSettings,
    CreateChannelParams,
    CreateMeetingParams,
    CreatePollParams,
    GetChannelsParams,
    GetMeetingsParams,
    GetMessagesParams,
    Meeting,
    Message,
    MessageStatus,
    Poll,
    SendMessageParams,
    UpdateChannelParams,
    UpdateMeetingParams,
    UpdateMessageParams,
} from '@/types/communication';
import { useEffect, useState } from 'react';

// Hook: Manage messages in a channel
export function useMessages(initialParams: GetMessagesParams) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = async (append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);
      const data = await getMessages(params);
      
      if (append) {
        setMessages((prev) => [...prev, ...data]);
      } else {
        setMessages(data);
      }
      
      setHasMore(data.length === (params.limit || 50));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [params]);

  const send = async (sendParams: Omit<SendMessageParams, 'channelId'>) => {
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      channelId: params.channelId,
      type: sendParams.type,
      content: sendParams.content,
      senderId: 'current-user', // Should come from auth context
      senderName: 'You',
      status: MessageStatus.SENDING,
      edited: false,
      deleted: false,
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [optimisticMessage, ...prev]);

    try {
      const newMessage = await sendMessage({
        ...sendParams,
        channelId: params.channelId,
      });
      
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? newMessage : m))
      );
      
      return newMessage;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      throw err;
    }
  };

  const update = async (updateParams: UpdateMessageParams) => {
    const { attachments: _ignoredAttachments, ...rest } = updateParams;
    const optimisticMessages: Message[] = messages.map((m) =>
      m.id === updateParams.id ? { ...m, ...rest, edited: true } : m
    );
    setMessages(optimisticMessages);

    try {
      const updatedMessage = await updateMessage(updateParams);
      setMessages((prev) => prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
      return updatedMessage;
    } catch (err: any) {
      setError(err.message || 'Failed to update message');
      fetchMessages();
      throw err;
    }
  };

  const remove = async (id: string) => {
    const optimisticMessages = messages.filter((m) => m.id !== id);
    setMessages(optimisticMessages);

    try {
      await deleteMessage(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
      fetchMessages();
      throw err;
    }
  };

  const react = async (messageId: string, reaction: string) => {
    try {
      const updatedMessage = await addReaction(messageId, reaction);
      setMessages((prev) => prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
      return updatedMessage;
    } catch (err: any) {
      setError(err.message || 'Failed to add reaction');
      throw err;
    }
  };

  const loadMore = () => {
    if (hasMore && messages.length > 0) {
      setParams((prev) => ({ ...prev, before: messages[messages.length - 1].id }));
      fetchMessages(true);
    }
  };

  const markRead = async () => {
    try {
      await markAsRead(params.channelId);
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
    }
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    refresh: fetchMessages,
    send,
    update,
    remove,
    react,
    loadMore,
    markRead,
  };
}

// Hook: Manage channels
export function useChannels(initialParams: GetChannelsParams) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChannels(params);
      setChannels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [params]);

  const create = async (createParams: CreateChannelParams) => {
    try {
      const newChannel = await createChannel(createParams);
      setChannels((prev) => [newChannel, ...prev]);
      return newChannel;
    } catch (err: any) {
      setError(err.message || 'Failed to create channel');
      throw err;
    }
  };

  const update = async (updateParams: UpdateChannelParams) => {
    const optimisticChannels = channels.map((c) =>
      c.id === updateParams.id
        ? {
            ...c,
            ...updateParams,
            settings: updateParams.settings
              ? { ...c.settings, ...updateParams.settings } as ChannelSettings
              : c.settings,
          }
        : c
    );
    setChannels(optimisticChannels);

    try {
      const updatedChannel = await updateChannel(updateParams);
      setChannels((prev) => prev.map((c) => (c.id === updatedChannel.id ? updatedChannel : c)));
      return updatedChannel;
    } catch (err: any) {
      setError(err.message || 'Failed to update channel');
      fetchChannels();
      throw err;
    }
  };

  const remove = async (id: string) => {
    const optimisticChannels = channels.filter((c) => c.id !== id);
    setChannels(optimisticChannels);

    try {
      await deleteChannel(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete channel');
      fetchChannels();
      throw err;
    }
  };

  return {
    channels,
    loading,
    error,
    params,
    setParams,
    refresh: fetchChannels,
    create,
    update,
    remove,
  };
}

// Hook: Single channel
export function useChannel(id: string | null) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setChannel(null);
      setLoading(false);
      return;
    }

    const fetchChannel = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getChannel(id);
        setChannel(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch channel');
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [id]);

  return { channel, loading, error };
}

// Hook: Meetings
export function useMeetings(initialParams: GetMeetingsParams) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMeetings(params);
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [params]);

  const create = async (createParams: CreateMeetingParams) => {
    try {
      const newMeeting = await createMeeting(createParams);
      setMeetings((prev) => [newMeeting, ...prev]);
      return newMeeting;
    } catch (err: any) {
      setError(err.message || 'Failed to create meeting');
      throw err;
    }
  };

  const update = async (updateParams: UpdateMeetingParams) => {
    const optimisticMeetings = meetings.map((m) =>
      m.id === updateParams.id ? { ...m, ...updateParams } : m
    );
    setMeetings(optimisticMeetings);

    try {
      const updatedMeeting = await updateMeeting(updateParams);
      setMeetings((prev) => prev.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m)));
      return updatedMeeting;
    } catch (err: any) {
      setError(err.message || 'Failed to update meeting');
      fetchMeetings();
      throw err;
    }
  };

  const remove = async (id: string) => {
    const optimisticMeetings = meetings.filter((m) => m.id !== id);
    setMeetings(optimisticMeetings);

    try {
      await deleteMeeting(id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete meeting');
      fetchMeetings();
      throw err;
    }
  };

  const respond = async (id: string, rsvp: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE') => {
    try {
      const updatedMeeting = await respondToMeeting(id, rsvp);
      setMeetings((prev) => prev.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m)));
      return updatedMeeting;
    } catch (err: any) {
      setError(err.message || 'Failed to respond to meeting');
      throw err;
    }
  };

  return {
    meetings,
    loading,
    error,
    params,
    setParams,
    refresh: fetchMeetings,
    create,
    update,
    remove,
    respond,
  };
}

// Hook: Single meeting
export function useMeeting(id: string | null) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setMeeting(null);
      setLoading(false);
      return;
    }

    const fetchMeeting = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMeeting(id);
        setMeeting(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch meeting');
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  return { meeting, loading, error };
}

// Hook: Polls
export function usePoll(messageId: string | null) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (createParams: Omit<CreatePollParams, 'channelId'>, channelId: string) => {
    try {
      setLoading(true);
      const newPoll = await createPoll({ ...createParams, channelId });
      setPoll(newPoll);
      return newPoll;
    } catch (err: any) {
      setError(err.message || 'Failed to create poll');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const vote = async (pollId: string, optionIds: string[]) => {
    try {
      const updatedPoll = await votePoll({ pollId, optionIds });
      setPoll(updatedPoll);
      return updatedPoll;
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
      throw err;
    }
  };

  return { poll, loading, error, create, vote };
}
