import { useContract, useSignatures } from '@/hooks/useContracts';
import type { Signature } from '@/types/contracts';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const SIGNATURE_PAD_HEIGHT = 200;

export default function SignContractScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contract, loading } = useContract(id!);
  const { signatures, signContract, rejectSignature } = useSignatures(id!);
  const [signing, setSigning] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string | null>(null);

  if (loading || !contract) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  const myParty = contract.parties[0]; // Mock - should get from auth context
  const mySignature = signatures.find((s) => s.partyId === myParty.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED':
        return '#0D9488';
      case 'REJECTED':
        return '#000000';
      default:
        return '#0D9488';
    }
  };

  const handleOpenSignaturePad = () => {
    Alert.alert(
      'Ký hợp đồng',
      'Tính năng chữ ký điện tử sẽ được triển khai với signature pad canvas.\n\nHiện tại đang dùng mock signature.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Ký (Mock)',
          onPress: () => handleMockSign(),
        },
      ]
    );
  };

  const handleMockSign = async () => {
    try {
      setSigning(true);
      // Mock signature data - will be replaced with real canvas signature
      const mockSignatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      await signContract({
        contractId: id!,
        partyId: myParty.id,
        signatureData: mockSignatureData,
        ipAddress: '127.0.0.1',
        deviceInfo: 'Mobile App',
      });

      Alert.alert(
        'Thành công',
        'Bạn đã ký hợp đồng thành công',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể ký hợp đồng. Vui lòng thử lại.');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = () => {
    Alert.prompt(
      'Từ chối ký',
      'Vui lòng nhập lý do từ chối:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async (reason?: string) => {
            if (!reason || reason.trim().length === 0) {
              Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
              return;
            }
            try {
              await rejectSignature(myParty.id, reason);
              Alert.alert(
                'Đã từ chối',
                'Bạn đã từ chối ký hợp đồng',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể từ chối. Vui lòng thử lại.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleViewSignature = (signature: Signature) => {
    if (signature.signatureData) {
      Alert.alert(
        'Xem chữ ký',
        'Tính năng xem chữ ký toàn màn hình sẽ được triển khai sau',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const allSigned = signatures.every((s) => s.status === 'SIGNED');
  const signedCount = signatures.filter((s) => s.status === 'SIGNED').length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{contract.title}</Text>
          <Text style={styles.contractNumber}>{contract.contractNumber}</Text>
          
          {allSigned && (
            <View style={styles.completeBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
              <Text style={styles.completeText}>Tất cả bên đã ký</Text>
            </View>
          )}
          
          {!allSigned && (
            <View style={styles.progressBadge}>
              <Ionicons name="time" size={20} color="#0D9488" />
              <Text style={styles.progressText}>
                {signedCount}/{signatures.length} bên đã ký
              </Text>
            </View>
          )}
        </View>

        {/* My Signature Status */}
        {mySignature && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trạng thái của bạn</Text>
            <View
              style={[
                styles.myStatusCard,
                { borderLeftColor: getStatusColor(mySignature.status) },
              ]}
            >
              <View style={styles.statusHeader}>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusName}>{mySignature.partyName}</Text>
                  <Text style={styles.statusRole}>{mySignature.partyRole}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(mySignature.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: getStatusColor(mySignature.status) },
                    ]}
                  >
                    {mySignature.status === 'SIGNED'
                      ? 'Đã ký'
                      : mySignature.status === 'REJECTED'
                      ? 'Đã từ chối'
                      : 'Chờ ký'}
                  </Text>
                </View>
              </View>

              {mySignature.status === 'SIGNED' && mySignature.signedAt && (
                <View style={styles.signedInfo}>
                  <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
                  <Text style={styles.signedText}>
                    Đã ký vào {formatDate(mySignature.signedAt)}
                  </Text>
                </View>
              )}

              {mySignature.status === 'REJECTED' && mySignature.rejectionReason && (
                <View style={styles.rejectedInfo}>
                  <Ionicons name="close-circle" size={16} color="#000000" />
                  <Text style={styles.rejectedText}>
                    Lý do: {mySignature.rejectionReason}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Signature Workflow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quy trình ký</Text>
          <Text style={styles.sectionSubtitle}>
            Các bên cần ký theo thứ tự dưới đây
          </Text>

          {signatures
            .sort((a, b) => a.order - b.order)
            .map((signature, index) => {
              const isLast = index === signatures.length - 1;
              return (
                <View key={signature.id}>
                  <View style={styles.signatureItem}>
                    <View style={styles.signatureLeft}>
                      <View
                        style={[
                          styles.signatureOrder,
                          {
                            backgroundColor:
                              signature.status === 'SIGNED'
                                ? '#0D9488'
                                : signature.status === 'REJECTED'
                                ? '#000000'
                                : '#0D9488',
                          },
                        ]}
                      >
                        <Text style={styles.signatureOrderText}>{signature.order}</Text>
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.signatureLine,
                            {
                              backgroundColor:
                                signature.status === 'SIGNED' ? '#0D9488' : '#E0E0E0',
                            },
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.signatureRight}>
                      <View style={styles.signatureHeader}>
                        <View>
                          <Text style={styles.signatureName}>{signature.partyName}</Text>
                          <Text style={styles.signatureRole}>{signature.partyRole}</Text>
                        </View>
                        <View
                          style={[
                            styles.signatureStatusBadge,
                            {
                              backgroundColor:
                                getStatusColor(signature.status) + '20',
                            },
                          ]}
                        >
                          {signature.status === 'SIGNED' && (
                            <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
                          )}
                          {signature.status === 'REJECTED' && (
                            <Ionicons name="close-circle" size={16} color="#000000" />
                          )}
                          {signature.status === 'PENDING' && (
                            <Ionicons name="time" size={16} color="#0D9488" />
                          )}
                        </View>
                      </View>

                      {signature.status === 'SIGNED' && signature.signedAt && (
                        <TouchableOpacity
                          style={styles.signaturePreview}
                          onPress={() => handleViewSignature(signature)}
                        >
                          <Ionicons name="create" size={20} color="#666" />
                          <Text style={styles.signaturePreviewText}>
                            Xem chữ ký • {formatDate(signature.signedAt)}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {signature.status === 'REJECTED' && signature.rejectionReason && (
                        <View style={styles.rejectionBox}>
                          <Text style={styles.rejectionReason}>
                            {signature.rejectionReason}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
        </View>

        {/* Contract Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung hợp đồng</Text>
          <View style={styles.contractPreview}>
            <Ionicons name="document-text" size={48} color="#999" />
            <Text style={styles.previewText}>Xem toàn bộ nội dung hợp đồng</Text>
            <TouchableOpacity style={styles.previewButton}>
              <Text style={styles.previewButtonText}>Xem chi tiết</Text>
              <Ionicons name="chevron-forward" size={20} color="#0D9488" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle" size={24} color="#0D9488" />
          <Text style={styles.noticeText}>
            Chữ ký điện tử của bạn có giá trị pháp lý như chữ ký tay. Vui lòng đọc kỹ
            nội dung hợp đồng trước khi ký.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      {mySignature?.status === 'PENDING' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleReject}
            disabled={signing}
          >
            <Ionicons name="close-circle" size={20} color="#000000" />
            <Text style={styles.rejectButtonText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signButton}
            onPress={handleOpenSignaturePad}
            disabled={signing}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={styles.signButtonText}>
              {signing ? 'Đang ký...' : 'Ký hợp đồng'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contractNumber: {
    fontSize: 13,
    color: '#0D9488',
    marginBottom: 12,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  myStatusCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusRole: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  signedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signedText: {
    fontSize: 12,
    color: '#0D9488',
  },
  rejectedInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  rejectedText: {
    flex: 1,
    fontSize: 12,
    color: '#000000',
  },
  signatureItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  signatureLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  signatureOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureOrderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  signatureLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  signatureRight: {
    flex: 1,
    paddingBottom: 16,
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signatureName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  signatureRole: {
    fontSize: 12,
    color: '#666',
  },
  signatureStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signaturePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
  },
  signaturePreviewText: {
    fontSize: 12,
    color: '#666',
  },
  rejectionBox: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
  },
  rejectionReason: {
    fontSize: 12,
    color: '#D32F2F',
  },
  contractPreview: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    gap: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000000',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  signButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#0D9488',
  },
  signButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
