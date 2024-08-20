import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

const PermissionsPage = () => {
  const {requestPermission} = useCameraPermission();

  return (
    <View style={styles.container}>
      <Text>Requesting for camera permission</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => requestPermission()}>
        <Text style={styles.buttonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
};

const NoCameraDeviceError = () => (
  <View style={styles.container}>
    <Text>No camera device found.</Text>
  </View>
);

const App = () => {
  const device = useCameraDevice('back');
  const {hasPermission} = useCameraPermission();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [takingPhoto, setTakingPhoto] = useState<boolean>(true); // Novo estado

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        console.log(granted);

        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Location Permission',
            'You have previously denied location permission and selected "Never ask again". Please go to settings to manually enable the permission.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return false;
        }

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photoData = await cameraRef.current.takePhoto();
        const photoUri = photoData.path; // Atualize para o caminho correto

        const locationPermissionGranted = await requestLocationPermission();
        if (locationPermissionGranted) {
          getGeolocation(photoUri);
        } else {
          console.error(
            'Location permission not granted.',
            locationPermissionGranted,
          );
        }
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  };

  const getGeolocation = (photoUri: string) => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        sendPhotoAndLocation(photoUri, position.coords);
      },
      error => {
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const sendPhotoAndLocation = async (
    photoUri: string,
    coords: Geolocation.GeoCoordinates,
  ) => {
    try {
      const filePath = await RNFS.stat(photoUri); // Verifica o caminho do arquivo
      console.log('File path:', filePath.path); // Certifique-se de que o arquivo existe

      const formData = new FormData();
      formData.append('photo', {
        uri: `file://${filePath.path}`, // Prefixo "file://"
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      formData.append('latitude', coords.latitude.toString());
      formData.append('longitude', coords.longitude.toString());

      console.log('Photo: ', photoUri);
      console.log('formData: ', formData);

      axios
        .post('http://172.25.0.3/api/photos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(response => {
          console.log('Photo and location sent successfully', response.data);

          // Armazene o URL da imagem retornado pelo Laravel
          const {photoUrl} = response.data;

          // Use o URL para exibir a imagem
          setPhoto(photoUrl);
          setTakingPhoto(false); // Altere o estado para não tirar foto
        })
        .catch(error => {
          console.error('Error sending photo and location', error);
        });
    } catch (error) {
      console.error('File access error:', error);
    }
  };

  const takeAnotherPhoto = () => {
    setPhoto(null);
    setTakingPhoto(true);
  };

  if (!hasPermission) {
    return <PermissionsPage />;
  }

  if (device == null) {
    return <NoCameraDeviceError />;
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <>
          <Image source={{uri: photo}} style={styles.photo} />
          {location && (
            <Text>
              Latitude: {location.latitude}, Longitude: {location.longitude}
            </Text>
          )}
          <TouchableOpacity style={styles.button} onPress={takeAnotherPhoto}>
            <Text style={styles.buttonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </>
      ) : takingPhoto ? (
        <>
          <Camera
            style={styles.camera}
            device={device}
            ref={cameraRef}
            isActive={true}
            photo={true} // Habilita a captura de fotos
          />
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.buttonText}>Take Picture</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.container}>
          <Text>No photo available.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  photo: {
    width: 300,
    height: 400,
    margin: 10,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default App;
