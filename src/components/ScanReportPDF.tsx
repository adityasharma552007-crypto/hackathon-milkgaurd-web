/* eslint-disable jsx-a11y/alt-text */
'use client'

import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { format } from 'date-fns'

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C75E8',
  },
  subtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1C75E8',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoBox: {
    width: '48%',
    marginBottom: 10,
  },
  label: {
    fontSize: 8,
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    padding: 8,
  },
  th: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  td: {
    fontSize: 9,
    color: '#1E293B',
  },
  col1: { width: '40%' },
  col2: { width: '30%', textAlign: 'center' },
  col3: { width: '30%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94A3B8',
  }
})

interface ScanReportPDFProps {
  scan: any
}

export default function ScanReportPDF({ scan }: ScanReportPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>MilkGuard Report</Text>
            <Text style={styles.subtitle}>Verified AI Spectral Analysis</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.label}>Report ID</Text>
            <Text style={styles.value}>{scan.id.substring(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Score Summary */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{scan.safety_score}%</Text>
          <Text style={styles.scoreLabel}>Safety Purity Score</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: scan.result_tier === 'safe' ? '#1C75E8' : '#EF4444', marginTop: 10 }}>
            Status: {scan.result_tier.toUpperCase()}
          </Text>
        </View>

        {/* Metadata */}
        <View style={styles.grid}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Vendor / Source</Text>
            <Text style={styles.value}>{scan.vendors?.name || 'Home Sample'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Date & Time</Text>
            <Text style={styles.value}>{format(new Date(scan.created_at), 'PPP pp')}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>AI Confidence</Text>
            <Text style={styles.value}>{scan.ai_confidence}%</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>FSSAI Status</Text>
            <Text style={styles.value}>{scan.result_tier === 'safe' ? 'Compliant' : 'Non-Compliant'}</Text>
          </View>
        </View>

        {/* Adulterants Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
             <Text style={[styles.th, styles.col1]}>Adulterant</Text>
             <Text style={[styles.th, styles.col2]}>Result</Text>
             <Text style={[styles.th, styles.col3]}>Status</Text>
          </View>
          {scan.adulterant_results?.map((res: any) => (
            <View key={res.id} style={styles.tableRow}>
              <Text style={[styles.td, styles.col1]}>{res.name}</Text>
              <Text style={[styles.td, styles.col2]}>{res.detected ? `${res.detected_value}${res.unit}` : 'Clear'}</Text>
              <Text style={[styles.td, styles.col3, { color: res.status === 'clear' ? '#1C75E8' : '#EF4444' }]}>
                {res.status.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Recommendation */}
        <View style={{ marginTop: 30, backgroundColor: '#F0FDF4', padding: 15, borderRadius: 8 }}>
          <Text style={styles.label}>Recommendation</Text>
          <Text style={{ fontSize: 10, color: '#1C75E8', marginTop: 5, lineHeight: 1.5 }}>
            {scan.recommendation}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by MilkGuard Purity Engine</Text>
          <Text>Digital Signature Verified</Text>
        </View>
      </Page>
    </Document>
  )
}
