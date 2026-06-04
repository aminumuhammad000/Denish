import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const DriverStep2Vehicle = ({ navigation }) => {
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  
  const [errors, setErrors] = useState({});
  const [vModalVisible, setVModalVisible] = useState(false);

  const vehicleTypes = ['Motorcycle', 'Car', 'Bicycle', 'Truck'];

  const handleContinue = () => {
    let newErrors = {};
    if (!make) newErrors.make = 'Field required';
    if (!model) newErrors.model = 'Field required';
    if (!plate) newErrors.plate = 'Field required';
    if (!color) newErrors.color = 'Field required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigation.navigate('DriverStep3Payout');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepText}>Step 2 of 5 | <Text style={styles.stepTitle}>Vehicle</Text></Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarActive} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.mainTitle}>Vehicle details</Text>
          <Text style={styles.subtitle}>Which vehicle will you use for deliveries?</Text>

          <View style={styles.form}>
            {/* Vehicle Type Dropdown-style */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle type</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setVModalVisible(true)}
              >
                <Text style={styles.dropdownText}>{vehicleType}</Text>
                <Ionicons name="chevron-down" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Selection Modal */}
            <Modal
              visible={vModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setVModalVisible(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={() => setVModalVisible(false)}
              >
                <View style={styles.vModalContent}>
                  {vehicleTypes.map((type) => (
                    <TouchableOpacity 
                      key={type} 
                      style={styles.vOption}
                      onPress={() => { setVehicleType(type); setVModalVisible(false); }}
                    >
                      <Text style={[styles.vOptionText, vehicleType === type && { color: Colors.primary, fontWeight: 'bold' }]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Make & Model Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Make</Text>
                <TextInput
                  style={[styles.input, errors.make && styles.inputError]}
                  placeholder=""
                  value={make}
                  onChangeText={(v) => { setMake(v); if(errors.make) setErrors({...errors, make: null}); }}
                />
                {errors.make && <Text style={styles.errorText}>{errors.make}</Text>}
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={[styles.input, errors.model && styles.inputError]}
                  placeholder="ACE 125"
                  placeholderTextColor="#999"
                  value={model}
                  onChangeText={(v) => { setModel(v); if(errors.model) setErrors({...errors, model: null}); }}
                />
              </View>
            </View>

            {/* Plate & Color Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Plate number</Text>
                <TextInput
                  style={[styles.input, errors.plate && styles.inputError]}
                  placeholder="LSR-482-AB"
                  placeholderTextColor="#999"
                  value={plate}
                  onChangeText={(v) => { setPlate(v); if(errors.plate) setErrors({...errors, plate: null}); }}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={[styles.input, errors.color && styles.inputError]}
                  placeholder="Red"
                  placeholderTextColor="#999"
                  value={color}
                  onChangeText={(v) => { setColor(v); if(errors.color) setErrors({...errors, color: null}); }}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  stepHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#EEE',
    borderRadius: 2,
    width: '100%',
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
    width: '40%', // 2 of 5
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: Colors.primary, // Orange as per reference
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: -4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  vModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: '100%',
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  vOption: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  vOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DriverStep2Vehicle;
