/**
 * Change Order Details & Approval Screen
 */

import {
    useChangeOrder,
    useChangeOrderLogs,
    useChangeOrders,
} from "@/hooks/useChangeOrder";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ApprovalDecision type defined locally - matches backend enum
type ApprovalDecision =
  | "APPROVE"
  | "REJECT"
  | "CONDITIONAL_APPROVE"
  | "REQUEST_REVISION";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#6B7280",
  SUBMITTED: "#3B82F6",
  UNDER_REVIEW: "#0066CC",
  PENDING_APPROVAL: "#666666",
  APPROVED: "#0066CC",
  REJECTED: "#000000",
  IMPLEMENTED: "#0066CC",
  CLOSED: "#6B7280",
  CANCELLED: "#9CA3AF",
};

export default function ChangeOrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { changeOrder, loading } = useChangeOrder(id as string);
  const { logs } = useChangeOrderLogs(id as string);
  const {
    submitChangeOrder,
    approveChangeOrder,
    rejectChangeOrder,
    implementChangeOrder,
    completeChangeOrder,
    updateImplementationProgress,
  } = useChangeOrders({});

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalDecision, setApprovalDecision] =
    useState<ApprovalDecision>("APPROVE");
  const [approvalComments, setApprovalComments] = useState("");
  const [approvalConditions, setApprovalConditions] = useState<string[]>([]);
  const [conditionText, setConditionText] = useState("");

  const [showImplementModal, setShowImplementModal] = useState(false);
  const [progressValue, setProgressValue] = useState("");
  const [progressDescription, setProgressDescription] = useState("");

  if (loading || !changeOrder) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statusColor = STATUS_COLORS[changeOrder.status];
  const costImpactColor =
    changeOrder.costImpact.type === "INCREASE"
      ? "#000000"
      : changeOrder.costImpact.type === "DECREASE"
        ? "#0066CC"
        : "#6B7280";

  const handleSubmit = async () => {
    try {
      await submitChangeOrder(changeOrder.id);
      Alert.alert("Success", "Change order submitted");
    } catch (err) {
      Alert.alert("Error", "Failed to submit change order");
    }
  };

  const handleApprove = async () => {
    try {
      await approveChangeOrder(changeOrder.id, {
        decision: approvalDecision,
        comments: approvalComments,
        conditions:
          approvalConditions.length > 0 ? approvalConditions : undefined,
      });
      setShowApprovalModal(false);
      Alert.alert("Success", `Change order ${approvalDecision.toLowerCase()}`);
    } catch (err) {
      Alert.alert("Error", "Failed to approve change order");
    }
  };

  const handleReject = async () => {
    try {
      await rejectChangeOrder(changeOrder.id, approvalComments);
      setShowApprovalModal(false);
      Alert.alert("Success", "Change order rejected");
    } catch (err) {
      Alert.alert("Error", "Failed to reject change order");
    }
  };

  const handleImplement = async () => {
    try {
      const progress = parseInt(progressValue, 10);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        Alert.alert(
          "Error",
          "Please enter a valid progress percentage (0-100)",
        );
        return;
      }

      await updateImplementationProgress(
        changeOrder.id,
        progress,
        progressDescription,
      );
      setShowImplementModal(false);
      setProgressValue("");
      setProgressDescription("");
      Alert.alert("Success", "Implementation progress updated");
    } catch (err) {
      Alert.alert("Error", "Failed to update progress");
    }
  };

  const handleComplete = async () => {
    Alert.alert("Complete Implementation", "Mark implementation as complete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          try {
            await completeChangeOrder(changeOrder.id);
            Alert.alert("Success", "Change order implementation completed");
          } catch (err) {
            Alert.alert("Error", "Failed to complete implementation");
          }
        },
      },
    ]);
  };

  const addCondition = () => {
    if (conditionText.trim()) {
      setApprovalConditions([...approvalConditions, conditionText.trim()]);
      setConditionText("");
    }
  };

  const removeCondition = (index: number) => {
    setApprovalConditions(approvalConditions.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: `${statusColor}15` }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText}>
                {changeOrder.status.replace(/_/g, " ")}
              </Text>
            </View>
          </View>

          <Text style={styles.coNumber}>
            {changeOrder.changeOrderNumber}
            {changeOrder.revisionNumber !== "0" &&
              ` Rev ${changeOrder.revisionNumber}`}
          </Text>
          <Text style={styles.title}>{changeOrder.title}</Text>

          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {changeOrder.type.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        {/* Key Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Information</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Priority</Text>
              <Text style={styles.gridValue}>{changeOrder.priority}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Required Date</Text>
              <Text style={styles.gridValue}>
                {new Date(changeOrder.requiredDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Project</Text>
              <Text style={styles.gridValue}>{changeOrder.projectName}</Text>
            </View>
            {changeOrder.category && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Category</Text>
                <Text style={styles.gridValue}>{changeOrder.category}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Requested By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requested By</Text>
          <View style={styles.contactCard}>
            <Ionicons name="person-circle" size={40} color="#3B82F6" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>
                {changeOrder.requestedBy.name}
              </Text>
              <Text style={styles.contactDetail}>
                {changeOrder.requestedBy.company}
              </Text>
              <Text style={styles.contactDetail}>
                {changeOrder.requestedBy.role}
              </Text>
              {changeOrder.requestedBy.email && (
                <Text style={styles.contactDetail}>
                  {changeOrder.requestedBy.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Description & Justification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{changeOrder.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Justification</Text>
          <Text style={styles.description}>{changeOrder.justification}</Text>
        </View>

        {/* Scope Change */}
        {changeOrder.scopeChange && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scope Change</Text>

            <View style={styles.scopeBlock}>
              <Text style={styles.scopeLabel}>Original Scope:</Text>
              <Text style={styles.scopeText}>
                {changeOrder.scopeChange.originalScope}
              </Text>
            </View>

            <View style={styles.scopeBlock}>
              <Text style={styles.scopeLabel}>Proposed Scope:</Text>
              <Text style={styles.scopeText}>
                {changeOrder.scopeChange.proposedScope}
              </Text>
            </View>

            {changeOrder.scopeChange.deletions &&
              changeOrder.scopeChange.deletions.length > 0 && (
                <View style={styles.changesList}>
                  <Text style={[styles.changesTitle, { color: "#000000" }]}>
                    Deletions:
                  </Text>
                  {changeOrder.scopeChange.deletions.map((item, index) => (
                    <View key={index} style={styles.changesItem}>
                      <Ionicons
                        name="remove-circle"
                        size={16}
                        color="#000000"
                      />
                      <Text style={styles.changesText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

            {changeOrder.scopeChange.additions &&
              changeOrder.scopeChange.additions.length > 0 && (
                <View style={styles.changesList}>
                  <Text style={[styles.changesTitle, { color: "#0066CC" }]}>
                    Additions:
                  </Text>
                  {changeOrder.scopeChange.additions.map((item, index) => (
                    <View key={index} style={styles.changesItem}>
                      <Ionicons name="add-circle" size={16} color="#0066CC" />
                      <Text style={styles.changesText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

            {changeOrder.scopeChange.modifications &&
              changeOrder.scopeChange.modifications.length > 0 && (
                <View style={styles.changesList}>
                  <Text style={[styles.changesTitle, { color: "#0066CC" }]}>
                    Modifications:
                  </Text>
                  {changeOrder.scopeChange.modifications.map((item, index) => (
                    <View key={index} style={styles.changesItem}>
                      <Ionicons
                        name="swap-horizontal"
                        size={16}
                        color="#0066CC"
                      />
                      <Text style={styles.changesText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
          </View>
        )}

        {/* Cost Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Impact</Text>
          <View style={[styles.impactCard, { borderColor: costImpactColor }]}>
            <View style={styles.impactRow}>
              <View style={styles.impactItem}>
                <Text style={styles.impactLabel}>Original</Text>
                <Text style={styles.impactValue}>
                  {changeOrder.costImpact.currency}{" "}
                  {changeOrder.costImpact.originalAmount.toLocaleString()}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#9CA3AF" />
              <View style={styles.impactItem}>
                <Text style={styles.impactLabel}>Proposed</Text>
                <Text style={styles.impactValue}>
                  {changeOrder.costImpact.currency}{" "}
                  {changeOrder.costImpact.proposedAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.changeBadge,
                { backgroundColor: `${costImpactColor}15` },
              ]}
            >
              <Text style={[styles.changeText, { color: costImpactColor }]}>
                {changeOrder.costImpact.type === "INCREASE" ? "+" : ""}
                {changeOrder.costImpact.type === "DECREASE" ? "-" : ""}
                {changeOrder.costImpact.currency}{" "}
                {Math.abs(changeOrder.costImpact.changeAmount).toLocaleString()}
                {" ("}
                {changeOrder.costImpact.type.replace(/_/g, " ")}
                {")"}
              </Text>
            </View>

            {changeOrder.costImpact.breakdown && (
              <View style={styles.breakdown}>
                <Text style={styles.breakdownTitle}>Cost Breakdown:</Text>
                {(changeOrder.costImpact.breakdown.labor ?? 0) > 0 && (
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Labor</Text>
                    <Text style={styles.breakdownValue}>
                      {changeOrder.costImpact.currency}{" "}
                      {(
                        changeOrder.costImpact.breakdown.labor ?? 0
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}
                {(changeOrder.costImpact.breakdown.material ?? 0) > 0 && (
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Material</Text>
                    <Text style={styles.breakdownValue}>
                      {changeOrder.costImpact.currency}{" "}
                      {(
                        changeOrder.costImpact.breakdown.material ?? 0
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}
                {(changeOrder.costImpact.breakdown.equipment ?? 0) > 0 && (
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Equipment</Text>
                    <Text style={styles.breakdownValue}>
                      {changeOrder.costImpact.currency}{" "}
                      {(
                        changeOrder.costImpact.breakdown.equipment ?? 0
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}
                {(changeOrder.costImpact.breakdown.subcontractor ?? 0) > 0 && (
                  <View style={styles.breakdownItem}>
                    <Text style={styles.breakdownLabel}>Subcontractor</Text>
                    <Text style={styles.breakdownValue}>
                      {changeOrder.costImpact.currency}{" "}
                      {(
                        changeOrder.costImpact.breakdown.subcontractor ?? 0
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {changeOrder.costImpact.estimatedBy && (
              <Text style={styles.estimatorText}>
                Estimated by: {changeOrder.costImpact.estimatedBy} on{" "}
                {new Date(
                  changeOrder.costImpact.estimatedDate,
                ).toLocaleDateString()}
                {changeOrder.costImpact.verified && (
                  <Text style={{ color: "#0066CC" }}>
                    {" "}
                    • Verified by {changeOrder.costImpact.verifiedBy}
                  </Text>
                )}
              </Text>
            )}
          </View>
        </View>

        {/* Schedule Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Impact</Text>
          <View
            style={[
              styles.impactCard,
              {
                borderColor:
                  changeOrder.scheduleImpact.type === "DELAY"
                    ? "#0066CC"
                    : changeOrder.scheduleImpact.type === "ACCELERATION"
                      ? "#0066CC"
                      : "#6B7280",
              },
            ]}
          >
            <View style={styles.impactRow}>
              <View style={styles.impactItem}>
                <Text style={styles.impactLabel}>Original</Text>
                <Text style={styles.impactValue}>
                  {changeOrder.scheduleImpact.originalDuration} days
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#9CA3AF" />
              <View style={styles.impactItem}>
                <Text style={styles.impactLabel}>Proposed</Text>
                <Text style={styles.impactValue}>
                  {changeOrder.scheduleImpact.proposedDuration} days
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor:
                    changeOrder.scheduleImpact.type === "DELAY"
                      ? "#FEF3C7"
                      : changeOrder.scheduleImpact.type === "ACCELERATION"
                        ? "#D1FAE5"
                        : "#F3F4F6",
                },
              ]}
            >
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      changeOrder.scheduleImpact.type === "DELAY"
                        ? "#0066CC"
                        : changeOrder.scheduleImpact.type === "ACCELERATION"
                          ? "#0066CC"
                          : "#6B7280",
                  },
                ]}
              >
                {changeOrder.scheduleImpact.type === "DELAY" ? "+" : ""}
                {changeOrder.scheduleImpact.type === "ACCELERATION" ? "-" : ""}
                {Math.abs(changeOrder.scheduleImpact.changeDuration)} days
                {" ("}
                {changeOrder.scheduleImpact.type.replace(/_/g, " ")}
                {")"}
                {changeOrder.scheduleImpact.criticalPath
                  ? " - CRITICAL PATH"
                  : ""}
              </Text>
            </View>

            {changeOrder.scheduleImpact.affectedActivities &&
              changeOrder.scheduleImpact.affectedActivities.length > 0 && (
                <View style={styles.activitiesList}>
                  <Text style={styles.activitiesTitle}>
                    Affected Activities:
                  </Text>
                  {changeOrder.scheduleImpact.affectedActivities.map(
                    (activity, index) => (
                      <Text key={index} style={styles.activityText}>
                        • {activity}
                      </Text>
                    ),
                  )}
                </View>
              )}

            {changeOrder.scheduleImpact.proposedMitigation && (
              <View style={styles.mitigationBox}>
                <Text style={styles.mitigationTitle}>Proposed Mitigation:</Text>
                <Text style={styles.mitigationText}>
                  {changeOrder.scheduleImpact.proposedMitigation}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Approval Workflow */}
        {changeOrder.approvalWorkflow &&
          changeOrder.approvalWorkflow.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Approval Workflow</Text>
              {changeOrder.approvalWorkflow.map((approval, index) => (
                <View key={index} style={styles.approvalCard}>
                  <View style={styles.approvalHeader}>
                    <View
                      style={[
                        styles.approvalIcon,
                        {
                          backgroundColor:
                            approval.status === "APPROVED"
                              ? "#D1FAE5"
                              : approval.status === "REJECTED"
                                ? "#FEE2E2"
                                : approval.status === "IN_PROGRESS"
                                  ? "#FEF3C7"
                                  : "#F3F4F6",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          approval.status === "APPROVED"
                            ? "checkmark-circle"
                            : approval.status === "REJECTED"
                              ? "close-circle"
                              : approval.status === "IN_PROGRESS"
                                ? "time"
                                : "ellipse-outline"
                        }
                        size={24}
                        color={
                          approval.status === "APPROVED"
                            ? "#0066CC"
                            : approval.status === "REJECTED"
                              ? "#000000"
                              : approval.status === "IN_PROGRESS"
                                ? "#0066CC"
                                : "#9CA3AF"
                        }
                      />
                    </View>
                    <View style={styles.approvalInfo}>
                      <Text style={styles.approvalName}>
                        {approval.approver.name}
                      </Text>
                      <Text style={styles.approvalRole}>
                        {approval.level.replace(/_/g, " ")} •{" "}
                        {approval.approver.role}
                      </Text>
                    </View>
                    {approval.isRequired && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>

                  {approval.decision && (
                    <View
                      style={[
                        styles.decisionBadge,
                        {
                          backgroundColor:
                            approval.decision === "APPROVE"
                              ? "#D1FAE5"
                              : approval.decision === "REJECT"
                                ? "#FEE2E2"
                                : approval.decision === "CONDITIONAL_APPROVE"
                                  ? "#FEF3C7"
                                  : "#E0E7FF",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.decisionText,
                          {
                            color:
                              approval.decision === "APPROVE"
                                ? "#0066CC"
                                : approval.decision === "REJECT"
                                  ? "#000000"
                                  : approval.decision === "CONDITIONAL_APPROVE"
                                    ? "#0066CC"
                                    : "#3B82F6",
                          },
                        ]}
                      >
                        {approval.decision.replace(/_/g, " ")}
                      </Text>
                    </View>
                  )}

                  {approval.comments && (
                    <Text style={styles.approvalComments}>
                      {approval.comments}
                    </Text>
                  )}

                  {approval.conditions && approval.conditions.length > 0 && (
                    <View style={styles.conditionsList}>
                      <Text style={styles.conditionsTitle}>Conditions:</Text>
                      {approval.conditions.map((condition, i) => (
                        <Text key={i} style={styles.conditionText}>
                          {i + 1}. {condition}
                        </Text>
                      ))}
                    </View>
                  )}

                  {approval.reviewedDate && (
                    <Text style={styles.reviewDate}>
                      Reviewed:{" "}
                      {new Date(approval.reviewedDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

        {/* Implementation Progress */}
        {changeOrder.implementation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Implementation</Text>
            <View style={styles.implementCard}>
              <View style={styles.implementHeader}>
                <Text style={styles.implementStatus}>
                  {changeOrder.implementation.status.replace(/_/g, " ")}
                </Text>
                <Text style={styles.implementProgress}>
                  {changeOrder.implementation.progress}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${changeOrder.implementation.progress}%` },
                  ]}
                />
              </View>

              {changeOrder.implementation.assignedTo && (
                <Text style={styles.implementAssigned}>
                  Assigned to: {changeOrder.implementation.assignedTo}
                </Text>
              )}

              {changeOrder.implementation.targetCompletionDate && (
                <Text style={styles.implementDate}>
                  Target:{" "}
                  {new Date(
                    changeOrder.implementation.targetCompletionDate,
                  ).toLocaleDateString()}
                </Text>
              )}

              {changeOrder.implementation.workLog &&
                changeOrder.implementation.workLog.length > 0 && (
                  <View style={styles.workLog}>
                    <Text style={styles.workLogTitle}>Work Log:</Text>
                    {changeOrder.implementation.workLog
                      .slice(0, 3)
                      .map((log, index) => (
                        <View key={index} style={styles.workLogItem}>
                          <Text style={styles.workLogDate}>
                            {new Date(log.date).toLocaleDateString()}
                          </Text>
                          <Text style={styles.workLogDesc}>
                            {log.description}
                          </Text>
                          <Text style={styles.workLogBy}>
                            By: {log.performedBy}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
            </View>
          </View>
        )}

        {/* Related Items */}
        {changeOrder.relatedItems &&
          (changeOrder.relatedItems.rfis?.length ||
            changeOrder.relatedItems.submittals?.length ||
            changeOrder.relatedItems.drawings?.length) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Related Items</Text>

              {changeOrder.relatedItems.rfis &&
                changeOrder.relatedItems.rfis.length > 0 && (
                  <View style={styles.relatedBox}>
                    <Text style={styles.relatedLabel}>RFIs:</Text>
                    {changeOrder.relatedItems.rfis.map((rfi, index) => (
                      <Text key={index} style={styles.relatedText}>
                        • {rfi}
                      </Text>
                    ))}
                  </View>
                )}

              {changeOrder.relatedItems.submittals &&
                changeOrder.relatedItems.submittals.length > 0 && (
                  <View style={styles.relatedBox}>
                    <Text style={styles.relatedLabel}>Submittals:</Text>
                    {changeOrder.relatedItems.submittals.map(
                      (submittal, index) => (
                        <Text key={index} style={styles.relatedText}>
                          • {submittal}
                        </Text>
                      ),
                    )}
                  </View>
                )}

              {changeOrder.relatedItems.drawings &&
                changeOrder.relatedItems.drawings.length > 0 && (
                  <View style={styles.relatedBox}>
                    <Text style={styles.relatedLabel}>Drawings:</Text>
                    {changeOrder.relatedItems.drawings.map((drawing, index) => (
                      <Text key={index} style={styles.relatedText}>
                        • {drawing}
                      </Text>
                    ))}
                  </View>
                )}
            </View>
          )}

        {/* Workflow Steps */}
        {changeOrder.workflowSteps && changeOrder.workflowSteps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workflow History</Text>
            {changeOrder.workflowSteps.map((step, index) => (
              <View key={index} style={styles.workflowStep}>
                <View style={styles.stepIcon}>
                  <View style={styles.stepDot} />
                  {index < changeOrder.workflowSteps!.length - 1 && (
                    <View style={styles.stepLine} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepAction}>
                    {step.actionTaken || step.name}
                  </Text>
                  <Text style={styles.stepBy}>
                    {step.assignee || step.assigneeRole} •{" "}
                    {step.completedAt
                      ? new Date(step.completedAt).toLocaleString()
                      : "Pending"}
                  </Text>
                  {step.comments && (
                    <Text style={styles.stepComments}>{step.comments}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {changeOrder.status === "DRAFT" && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.submitBtn]}
            onPress={handleSubmit}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Submit</Text>
          </TouchableOpacity>
        )}

        {(changeOrder.status === "SUBMITTED" ||
          changeOrder.status === "UNDER_REVIEW") && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => {
                setApprovalDecision("APPROVE");
                setShowApprovalModal(true);
              }}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => {
                setApprovalDecision("REJECT");
                setShowApprovalModal(true);
              }}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}

        {changeOrder.status === "APPROVED" && changeOrder.implementation && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.implementBtn]}
              onPress={() => setShowImplementModal(true)}
            >
              <Ionicons name="construct" size={20} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Update Progress</Text>
            </TouchableOpacity>

            {changeOrder.implementation.progress < 100 && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={handleComplete}
              >
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Complete</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity style={[styles.actionBtn, styles.exportBtn]}>
          <Ionicons name="download" size={20} color="#6B7280" />
          <Text style={[styles.actionBtnText, { color: "#6B7280" }]}>
            Export
          </Text>
        </TouchableOpacity>
      </View>

      {/* Approval Modal */}
      <Modal visible={showApprovalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {approvalDecision === "APPROVE" ? "Approve" : "Reject"} Change
                Order
              </Text>
              <TouchableOpacity onPress={() => setShowApprovalModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {approvalDecision !== "REJECT" && (
              <View style={styles.decisionSelector}>
                <TouchableOpacity
                  style={[
                    styles.decisionOption,
                    approvalDecision === "APPROVE" &&
                      styles.decisionOptionActive,
                  ]}
                  onPress={() => setApprovalDecision("APPROVE")}
                >
                  <Text
                    style={[
                      styles.decisionOptionText,
                      approvalDecision === "APPROVE" &&
                        styles.decisionOptionTextActive,
                    ]}
                  >
                    Approve
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.decisionOption,
                    approvalDecision === "CONDITIONAL_APPROVE" &&
                      styles.decisionOptionActive,
                  ]}
                  onPress={() => setApprovalDecision("CONDITIONAL_APPROVE")}
                >
                  <Text
                    style={[
                      styles.decisionOptionText,
                      approvalDecision === "CONDITIONAL_APPROVE" &&
                        styles.decisionOptionTextActive,
                    ]}
                  >
                    Conditional
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.decisionOption,
                    approvalDecision === "REQUEST_REVISION" &&
                      styles.decisionOptionActive,
                  ]}
                  onPress={() => setApprovalDecision("REQUEST_REVISION")}
                >
                  <Text
                    style={[
                      styles.decisionOptionText,
                      approvalDecision === "REQUEST_REVISION" &&
                        styles.decisionOptionTextActive,
                    ]}
                  >
                    Request Revision
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Comments..."
              value={approvalComments}
              onChangeText={setApprovalComments}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {approvalDecision === "CONDITIONAL_APPROVE" && (
              <View style={styles.conditionsSection}>
                <Text style={styles.conditionsSectionTitle}>Conditions:</Text>
                {approvalConditions.map((condition, index) => (
                  <View key={index} style={styles.conditionItem}>
                    <Text style={styles.conditionItemText}>{condition}</Text>
                    <TouchableOpacity onPress={() => removeCondition(index)}>
                      <Ionicons name="close-circle" size={20} color="#000000" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.conditionInputRow}>
                  <TextInput
                    style={styles.conditionInput}
                    placeholder="Add condition..."
                    value={conditionText}
                    onChangeText={setConditionText}
                  />
                  <TouchableOpacity
                    style={styles.addConditionBtn}
                    onPress={addCondition}
                  >
                    <Ionicons name="add" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowApprovalModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  approvalDecision === "REJECT"
                    ? styles.rejectBtn
                    : styles.approveBtn,
                ]}
                onPress={
                  approvalDecision === "REJECT" ? handleReject : handleApprove
                }
              >
                <Text style={styles.actionBtnText}>
                  {approvalDecision === "REJECT" ? "Reject" : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Implementation Progress Modal */}
      <Modal visible={showImplementModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Update Implementation Progress
              </Text>
              <TouchableOpacity onPress={() => setShowImplementModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Progress (%)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter progress (0-100)"
              value={progressValue}
              onChangeText={setProgressValue}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Describe work completed..."
              value={progressDescription}
              onChangeText={setProgressDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowImplementModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.implementBtn]}
                onPress={handleImplement}
              >
                <Text style={styles.actionBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 48,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  coNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EDE9FE",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666666",
    textTransform: "capitalize",
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "48%",
  },
  gridLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  scopeBlock: {
    marginBottom: 12,
  },
  scopeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  scopeText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },
  changesList: {
    marginTop: 8,
  },
  changesTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  changesItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  changesText: {
    fontSize: 13,
    color: "#4B5563",
    marginLeft: 6,
  },
  impactCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },
  impactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  impactItem: {
    flex: 1,
    alignItems: "center",
  },
  impactLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  changeBadge: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  breakdown: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#4B5563",
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  estimatorText: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
  },
  activitiesList: {
    marginTop: 8,
  },
  activitiesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  activityText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 2,
  },
  mitigationBox: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  mitigationTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  mitigationText: {
    fontSize: 12,
    color: "#4B5563",
  },
  approvalCard: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  approvalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  approvalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  approvalInfo: {
    flex: 1,
  },
  approvalName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  approvalRole: {
    fontSize: 11,
    color: "#6B7280",
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000000",
  },
  decisionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  decisionText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  approvalComments: {
    fontSize: 13,
    color: "#4B5563",
    fontStyle: "italic",
    marginBottom: 8,
  },
  conditionsList: {
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  conditionsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D97706",
    marginBottom: 6,
  },
  conditionText: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
  },
  implementCard: {
    backgroundColor: "#F5F3FF",
    padding: 12,
    borderRadius: 12,
  },
  implementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  implementStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
    textTransform: "capitalize",
  },
  implementProgress: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666666",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#DDD6FE",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#666666",
  },
  implementAssigned: {
    fontSize: 12,
    color: "#6B21A8",
    marginBottom: 4,
  },
  implementDate: {
    fontSize: 12,
    color: "#6B21A8",
    marginBottom: 8,
  },
  workLog: {
    marginTop: 8,
  },
  workLogTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B21A8",
    marginBottom: 6,
  },
  workLogItem: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  workLogDate: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  workLogDesc: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 2,
  },
  workLogBy: {
    fontSize: 10,
    color: "#6B7280",
    fontStyle: "italic",
  },
  relatedBox: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  relatedText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 2,
  },
  workflowStep: {
    flexDirection: "row",
    marginBottom: 12,
  },
  stepIcon: {
    alignItems: "center",
    marginRight: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepAction: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  stepBy: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  stepComments: {
    fontSize: 12,
    color: "#4B5563",
    fontStyle: "italic",
  },
  actionBar: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  submitBtn: {
    backgroundColor: "#3B82F6",
  },
  approveBtn: {
    backgroundColor: "#0066CC",
  },
  rejectBtn: {
    backgroundColor: "#000000",
  },
  implementBtn: {
    backgroundColor: "#666666",
  },
  completeBtn: {
    backgroundColor: "#0066CC",
  },
  exportBtn: {
    backgroundColor: "#F3F4F6",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  decisionSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  decisionOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  decisionOptionActive: {
    backgroundColor: "#3B82F6",
  },
  decisionOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  decisionOptionTextActive: {
    color: "#FFFFFF",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 16,
  },
  conditionsSection: {
    marginBottom: 16,
  },
  conditionsSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  conditionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  conditionItemText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
  },
  conditionInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  conditionInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
  },
  addConditionBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E8F4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
});
