import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ProgressBar } from '../components/OnboardingComponents';
import { useOnboarding } from '../context/OnboardingContext';

const TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00'
];

const DayRow = ({ day, data, onToggle, onTimePress }) => (
  <View style={styles.dayRow}>
    <View style={styles.dayCol}>
      <Text style={styles.label}>{day}</Text>
      <View style={styles.statusRow}>
        <Switch
          value={data.isOpen}
          onValueChange={() => onToggle(day)}
          trackColor={{ false: "#DDD", true: Colors.primary + "80" }}
          thumbColor={data.isOpen ? Colors.primary : "#f4f3f4"}
        />
        <Text style={[styles.statusText, { color: data.isOpen ? Colors.primary : '#999' }]}>
          {data.isOpen ? 'Open' : 'Closed'}
        </Text>
      </View>
    </View>
    <View style={styles.timeCol}>
      <Text style={styles.label}>Opening Times</Text>
      <TouchableOpacity 
        style={[styles.dropdown, !data.isOpen && styles.dropdownDisabled]}
        disabled={!data.isOpen}
        onPress={() => onTimePress(day)}
      >
        <Text style={[styles.inputText, !data.isOpen && { color: '#CCC' }]}>
          {data.isOpen ? `${data.openAt} - ${data.closeAt}` : '--:--'}
        </Text>
        <Ionicons name="time-outline" size={18} color={data.isOpen ? "#666" : "#CCC"} />
      </TouchableOpacity>
    </View>
  </View>
);

const OpeningHoursScreen = ({ navigation }) => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [hours, setHours] = useState(
    Object.keys(onboardingData.openingHours || {}).length > 0
      ? onboardingData.openingHours
      : {
          Monday:    { isOpen: true, openAt: '08:00', closeAt: '22:00' },
          Tuesday:   { isOpen: true, openAt: '08:00', closeAt: '22:00' },
          Wednesday: { isOpen: true, openAt: '08:00', closeAt: '22:00' },
          Thursday:  { isOpen: true, openAt: '08:00', closeAt: '22:00' },
          Friday:    { isOpen: true, openAt: '08:00', closeAt: '22:00' },
          Saturday:  { isOpen: true, openAt: '08:00', closeAt: '22:00' },
          Sunday:    { isOpen: false, openAt: '08:00', closeAt: '22:00' },
        }
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [pickingType, setPickingType] = useState('openAt'); // 'openAt' or 'closeAt'
  const [customTime, setCustomTime] = useState('');

  const toggleDay = (day) => {
    setHours({
      ...hours,
      [day]: { ...hours[day], isOpen: !hours[day].isOpen }
    });
  };

  const openTimePicker = (day) => {
    setActiveDay(day);
    setPickingType('openAt');
    setCustomTime('');
    setModalVisible(true);
  };

  const handleCustomTimeChange = (text) => {
    // Allow user to delete backwards
    if (text.length < customTime.length) {
      setCustomTime(text);
      return;
    }

    // Keep only digits and colon
    const cleaned = text.replace(/[^0-9:]/g, '');

    // Auto-insert colon if typing without one (e.g. "083" -> "08:3" or "08" -> "08:")
    if (cleaned.length === 2 && !cleaned.includes(':') && customTime.length < 2) {
      setCustomTime(cleaned + ':');
    } else if (cleaned.length === 3 && !cleaned.includes(':')) {
      setCustomTime(cleaned.slice(0, 2) + ':' + cleaned.slice(2));
    } else if (cleaned.length === 4 && !cleaned.includes(':')) {
      setCustomTime(cleaned.slice(0, 2) + ':' + cleaned.slice(2));
    } else {
      setCustomTime(cleaned.slice(0, 5));
    }
  };

  const handleCustomSubmit = () => {
    let time = customTime.trim();
    if (!time) return;

    // If user typed 4 digits without colon (e.g. 0830), auto-format to 08:30
    if (/^\d{4}$/.test(time)) {
      time = `${time.slice(0, 2)}:${time.slice(2)}`;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(time)) {
      Alert.alert(
        'Time Format',
        'Please enter a valid time with a colon between numbers (e.g., 08:30 or 22:00).'
      );
      return;
    }

    const [h, m] = time.split(':');
    const normalized = `${h.padStart(2, '0')}:${m}`;
    selectTime(normalized);
  };

  const selectTime = (time) => {
    if (pickingType === 'openAt') {
      setHours({
        ...hours,
        [activeDay]: { ...hours[activeDay], openAt: time }
      });
      setPickingType('closeAt');
    } else {
      setHours({
        ...hours,
        [activeDay]: { ...hours[activeDay], closeAt: time }
      });
      setModalVisible(false);
    }
  };

  const days = Object.keys(hours);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProgressBar currentStep={2} totalSteps={5} title="Opening Hours" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Opening hours</Text>
          <Text style={styles.subtitle}>Set your weekly schedule</Text>
        </View>

        <View style={styles.daysList}>
          {days.map((day) => (
            <DayRow 
              key={day} 
              day={day} 
              data={hours[day]} 
              onToggle={toggleDay}
              onTimePress={openTimePicker}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            updateOnboardingData({ openingHours: hours });
            navigation.navigate('Step3');
          }}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Time Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeDay} - {pickingType === 'openAt' ? 'Opening Time' : 'Closing Time'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Helpful instruction hint */}
            <View style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={15} color="#64748B" />
              <Text style={styles.hintText}>
                Enter time with a colon (e.g. 08:30) or pick below:
              </Text>
            </View>

            {/* Manual Entry */}
            <View style={styles.customEntryRow}>
              <TextInput
                style={styles.customInput}
                placeholder="08:30 (add colon : between numbers)"
                placeholderTextColor="#94A3B8"
                value={customTime}
                onChangeText={handleCustomTimeChange}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity 
                style={[styles.customAddBtn, customTime.length < 4 && { opacity: 0.5 }]} 
                onPress={handleCustomSubmit}
                disabled={customTime.length < 4}
              >
                <Text style={styles.customAddBtnText}>Set</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listSectionHeader}>
              <Text style={styles.listSectionTitle}>Or select a standard time</Text>
            </View>

            <FlatList
              data={TIMES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.timeItem}
                  onPress={() => selectTime(item)}
                >
                  <Text style={styles.timeItemText}>{item}</Text>
                  {(pickingType === 'openAt' ? hours[activeDay]?.openAt === item : hours[activeDay]?.closeAt === item) && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  daysList: {
    gap: 12,
    marginBottom: 30,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  dayCol: {
    flex: 1,
    gap: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeCol: {
    flex: 1.8,
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 6,
    padding: 8,
  },
  dropdownDisabled: {
    backgroundColor: '#FAFAFA',
    borderColor: '#F0F0F0',
  },
  inputText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  timeItemText: {
    fontSize: 16,
    color: '#333',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  customEntryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  customAddBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  customAddBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listSectionHeader: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 4,
  },
  listSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default OpeningHoursScreen;
