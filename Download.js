import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import RNFetchBlob from 'rn-fetch-blob';

const DownloadScreen = () => {
  const [downloadedVideos, setDownloadedVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDownloadedVideos();
  }, []);

  const loadDownloadedVideos = async () => {
    try {
      const videosMetadata = await AsyncStorage.getItem('downloaded_videos');
      if (videosMetadata) {
        setDownloadedVideos(JSON.parse(videosMetadata));
      }
    } catch (error) {
      console.error('Error loading downloaded videos:', error);
    }
  };

  const downloadVideo = async () => {
    setIsLoading(true);
    try {
      const videoUrl =
        'https://www.ssfl.enabled.live/spandana-content/objects/OB00136.mp4';
      const videoName = 'OB00136.mp4';
      const videoPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${videoName}`;

      const res = await RNFetchBlob.config({
        path: videoPath,
      }).fetch('GET', videoUrl);

      console.log('Downloaded video:', res.path());

      const newDownloadedVideos = [
        ...downloadedVideos,
        {name: videoName, uri: videoPath},
      ];
      await AsyncStorage.setItem(
        'downloaded_videos',
        JSON.stringify(newDownloadedVideos),
      );
      setDownloadedVideos(newDownloadedVideos);
      console.log('Video downloaded successfully!');
    } catch (error) {
      console.error('Error downloading video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity>
      <View style={styles.itemContainer}>
        <Text>{item.name}</Text>
        <Button title="Play" onPress={() => setSelectedVideo(item)} />
        <Button title="Delete" onPress={() => handleDeleteVideo(item.name)} />
      </View>
    </TouchableOpacity>
  );

  const handleDeleteVideo = async videoName => {
    const newDownloadedVideos = downloadedVideos.filter(
      video => video.name !== videoName,
    );
    await AsyncStorage.setItem(
      'downloaded_videos',
      JSON.stringify(newDownloadedVideos),
    );
    setDownloadedVideos(newDownloadedVideos);
  };

  return (
    <View style={styles.container}>
      <Button title="Close" onPress={() => setSelectedVideo(false)} />
      <Button title="Download Video" onPress={downloadVideo} />
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {selectedVideo && (
        <View style={styles.videoContainer}>
          <Video
            source={{uri: selectedVideo.uri}}
            style={styles.videoPlayer}
            controls={true}
            resizeMode="contain"
            onEnd={() => setSelectedVideo(false)}
            onError={error => console.error('Video playback error:', error)}
          />
        </View>
      )}
      <FlatList
        data={downloadedVideos}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  listContainer: {
    flexGrow: 1,
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    flex: 1,
    width: '100%',
  },
});

export default DownloadScreen;
